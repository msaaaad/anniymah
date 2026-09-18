"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Login failed");
      setSubmitting(false);
      return;
    }

    router.push("/admin/landing");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-bg px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[10px] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(46,42,37,.04),0_6px_20px_rgba(46,42,37,.05)]"
      >
        <h1 className="font-heading text-xl font-semibold text-text">Admin Login</h1>
        <p className="mt-1 text-sm text-muted">An Niymah admin dashboard</p>

        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[13px] text-muted">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[13px] text-muted">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>

        {error && <p className="mt-3 text-sm text-rose-dark">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-[8px] bg-sage px-[26px] py-[13px] font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
