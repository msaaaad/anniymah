"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client";
import { btnGhost } from "@/components/admin/styles";

const LINKS = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminNav({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await apiJson("/auth/logout", "POST").catch(() => undefined);
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-[28px]">
        <span className="flex items-center gap-2 font-heading text-base font-semibold sm:text-lg">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static logo, no next/image config needed */}
          <img src="/logo-mark.webp" alt="" width={28} height={28} className="rounded-md" />
          Anniymah Admin
        </span>
        <nav aria-label="Admin" className="flex items-center gap-3 sm:gap-5">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "border-b-2 border-sage pb-0.5 text-sm font-semibold text-sage-dark"
                    : "pb-0.5 text-sm text-muted hover:text-text"
                }
              >
                {link.label}
              </Link>
            );
          })}
          {email && <span className="hidden text-xs text-muted md:inline">{email}</span>}
          <button onClick={handleLogout} className={btnGhost}>
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
