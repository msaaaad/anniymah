"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface AdminShellProps {
  email?: string;
  children: React.ReactNode;
}

export function AdminShell({ email, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Permanent on desktop, drawer on mobile */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content layout offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <AdminHeader email={email} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="w-full flex-1 px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
