"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import { btnPrimary, cardClass, inputClass, labelClass } from "@/components/admin/styles";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    try {
      await apiJson("/auth/login", "POST", {
        email: formData.get("email"),
        password: formData.get("password"),
      });
      window.location.href = "/admin/products";
    } catch (err) {
      setError(errorMessages(err, "Login failed").join(", "));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-bg px-6">
      <form method="POST" onSubmit={handleSubmit} className={`${cardClass} w-full max-w-sm p-6`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- small static logo, no next/image config needed */}
        <img src="/logo-mark.webp" alt="" width={40} height={40} className="mb-3 rounded-lg" />
        <h1 className="font-heading text-xl font-semibold text-text">Admin Login</h1>
        <p className="mt-1 text-sm text-muted">Anniymah admin dashboard</p>

        <div className="mt-5 flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-danger-dark">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${btnPrimary} mt-5 w-full py-3`}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
