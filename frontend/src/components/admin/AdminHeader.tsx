"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client";

interface AdminHeaderProps {
  email?: string;
  onOpenSidebar: () => void;
}

export function AdminHeader({ email, onOpenSidebar }: AdminHeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  async function handleLogout() {
    await apiJson("/auth/logout", "POST").catch(() => undefined);
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-8">
      {/* Left side: mobile menu button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-lg border border-border p-2 text-muted hover:bg-media-bg hover:text-text md:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="hidden text-sm font-medium text-muted sm:inline-block">
          Anniymah Management Dashboard
        </span>
      </div>

      {/* Right side: User icon dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-label="User menu"
          className="flex items-center gap-2.5 rounded-full border border-border bg-surface p-1.5 pl-2.5 pr-3 shadow-2xs transition-colors hover:border-sage-dark focus-visible:outline-2 focus-visible:outline-sage"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-tint text-sage-dark">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span className="hidden text-xs font-semibold text-text md:inline">Anniymah admin</span>
          <svg
            className={`h-4 w-4 text-muted transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute right-0 mt-2 w-56 rounded-[10px] border border-border bg-surface p-1.5 shadow-[var(--shadow)] animate-in fade-in-50 zoom-in-95"
          >
            {/* Header info */}
            <div className="border-b border-border px-3 py-2.5">
              <div className="text-sm font-semibold text-text">Anniymah admin</div>
              {email && <div className="truncate text-xs text-muted">{email}</div>}
            </div>

            {/* Logout button */}
            <div className="pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger-tint focus-visible:outline-none"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
