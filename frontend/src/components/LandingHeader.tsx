"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "#top", label: "Home" },
  { href: "#inside", label: "What's inside" },
  { href: "#order", label: "Order" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="row">
        <a href="#top" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- small static logo, no next/image config needed */}
          <img src="/logo-mark.webp" alt="" width={32} height={32} className="brand-mark" />
          <span className="brand-text">
            <span className="name">Anniymah</span>
            <span className="tag">premium perfume combo</span>
          </span>
        </a>
        <nav className="main-nav">
          {NAV_LINKS.map((link, i) => (
            <a key={link.href} href={link.href} className={i === 0 ? "active" : ""}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a href="#order" className="btn btn-primary btn-sm">
            Order now
          </a>
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
      <nav className={`mobile-nav${open ? " open" : ""}`}>
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.href}
            href={link.href}
            className={i === 0 ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
