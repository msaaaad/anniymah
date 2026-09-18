import { getLandingPage } from "@/lib/db";
import { OrderForm } from "@/components/OrderForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const landing = await getLandingPage();

  return (
    <div className="flex-1 pb-24 sm:pb-0">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-[28px] py-4">
          <span className="font-heading text-lg font-semibold">An Niymah</span>
          <span className="text-sm text-muted">ঢাকার ভেতরে ফ্রি ডেলিভারি</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-[28px] py-10">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-block rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white">
              Trending
            </span>
            <h1 className="font-heading mt-4 text-[38px] font-semibold leading-tight sm:text-[46px]">
              {landing.title}
            </h1>
            <p className="mt-4 text-[17px] text-muted">{landing.description}</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-heading text-3xl font-semibold text-sage-dark">
                ৳{landing.price}
              </span>
              <span className="text-sm text-muted">ফ্রি ডেলিভারি সহ</span>
            </div>
            <a
              href="#order-form"
              className="mt-6 inline-block rounded-[8px] bg-sage px-[26px] py-[13px] font-medium text-white transition-colors hover:bg-sage-dark"
            >
              এখনই অর্ডার করুন
            </a>
          </div>
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-media-bg">
            {landing.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-supplied external URL, no domain to allow-list yet
              <img
                src={landing.imageUrl}
                alt={landing.title}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <span className="text-sm text-muted">প্রোডাক্ট ছবি শীঘ্রই যুক্ত হবে</span>
            )}
          </div>
        </section>

        {landing.part2Enabled && (
          <section className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold sm:text-[28px]">
              {landing.part2Title}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-center">
              <div className="flex aspect-video items-center justify-center rounded-2xl bg-media-bg">
                {landing.part2ImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-supplied external URL, no domain to allow-list yet
                  <img
                    src={landing.part2ImageUrl}
                    alt={landing.part2Title}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-sm text-muted">ছবি শীঘ্রই যুক্ত হবে</span>
                )}
              </div>
              <p className="text-[17px] text-muted">{landing.part2Text}</p>
            </div>
          </section>
        )}

        <section className="mt-16 max-w-xl">
          <OrderForm price={landing.price} />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface p-3 sm:hidden">
        <a
          href="#order-form"
          className="block w-full rounded-[8px] bg-sage px-[26px] py-[13px] text-center font-medium text-white"
        >
          এখনই অর্ডার করুন — ৳{landing.price}
        </a>
      </div>
    </div>
  );
}
