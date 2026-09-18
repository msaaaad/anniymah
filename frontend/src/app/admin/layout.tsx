import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg">
      <AdminNav />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-[28px] py-8">{children}</main>
    </div>
  );
}
