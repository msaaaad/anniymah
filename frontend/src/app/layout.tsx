import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

// No NEXT_PUBLIC_ prefix needed — this file is a Server Component, so
// process.env is read on the server at render time and the value is baked
// straight into the returned HTML, not inlined into a client bundle.
const META_PIXEL_ID = process.env.META_PIXEL_ID;

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
        {META_PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element -- Meta Pixel's own noscript fallback, must be a plain img tag */}
              <img
                height={1}
                width={1}
                alt=""
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        )}
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
