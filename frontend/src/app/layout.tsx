import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anniymah",
  description: "৪-ইন-১ পারফিউম কম্বো — ঢাকার ভেতরে ফ্রি ডেলিভারি, ক্যাশ অন ডেলিভারি।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-text">
        {children}
        <Toaster
          position="top-right"
          offset={{ top: 84 }}
          toastOptions={{
            classNames: { success: "toast-success", error: "toast-error" },
            style: { borderRadius: "10px", border: "none" },
          }}
        />
      </body>
    </html>
  );
}
