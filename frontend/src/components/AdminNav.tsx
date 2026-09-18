"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (pathname === "/admin/login") return null;

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-[28px] py-4">
        <span className="font-heading text-lg font-semibold">An Niymah Admin</span>
        <nav className="flex items-center gap-4">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname.startsWith(link.href)
                  ? "text-sm font-semibold text-sage-dark"
                  : "text-sm text-muted hover:text-text"
              }
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="rounded-[8px] border border-border px-4 py-2 text-sm hover:border-sage-dark hover:text-sage-dark"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
