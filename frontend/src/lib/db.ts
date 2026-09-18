import { promises as fs } from "node:fs";
import path from "node:path";
import type { Database, LandingPage, Order, OrderStatus } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const SEED_PATH = path.join(process.cwd(), "data", "db.seed.json");

// Single-process write queue so concurrent requests can't interleave
// read-modify-write cycles and clobber each other's changes.
let writeQueue: Promise<unknown> = Promise.resolve();

function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(fn, fn);
  writeQueue = result.catch(() => undefined);
  return result;
}

async function ensureDbFile(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    const seed = await fs.readFile(SEED_PATH, "utf-8");
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, seed, "utf-8");
  }
}

async function readDb(): Promise<Database> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as Database;
}

async function writeDb(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export async function getLandingPage(): Promise<LandingPage> {
  const db = await readDb();
  return db.landingPage;
}

export async function updateLandingPage(
  patch: Partial<Omit<LandingPage, "id" | "updatedAt">>
): Promise<LandingPage> {
  return withWriteLock(async () => {
    const db = await readDb();
    db.landingPage = {
      ...db.landingPage,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeDb(db);
    return db.landingPage;
  });
}

export async function listOrders(): Promise<Order[]> {
  const db = await readDb();
  return [...db.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createOrder(
  input: Pick<Order, "customerName" | "phone" | "address" | "quantity" | "notes">
): Promise<Order> {
  return withWriteLock(async () => {
    const db = await readDb();
    const unitPrice = db.landingPage.price;
    const order: Order = {
      id: crypto.randomUUID(),
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      quantity: input.quantity,
      unitPrice,
      total: unitPrice * input.quantity,
      notes: input.notes,
      status: "pending",
      createdAt: new Date().toISOString(),
      confirmedAt: null,
    };
    db.orders.push(order);
    await writeDb(db);
    return order;
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  return withWriteLock(async () => {
    const db = await readDb();
    const order = db.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.confirmedAt = status === "confirmed" ? new Date().toISOString() : order.confirmedAt;
    await writeDb(db);
    return order;
  });
}
