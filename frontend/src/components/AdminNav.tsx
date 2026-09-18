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
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-[28px]">
        <span className="font-heading text-base font-semibold sm:text-lg">Anniymah Admin</span>
        <nav className="flex items-center gap-3 sm:gap-4">
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
            className="rounded-[8px] border border-border px-3 py-2 text-sm hover:border-sage-dark hover:text-sage-dark sm:px-4"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
