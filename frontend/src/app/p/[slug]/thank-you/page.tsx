import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/lib/db";
import "../../../landing.css";

export const dynamic = "force-dynamic";

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string; total?: string }>;
}) {
  const { slug } = await params;
  const { name, total } = await searchParams;
  const landing = await getLandingPageBySlug(slug);
  if (!landing) notFound();

  return (
    <div className="landing-body">
      <header className="site-header">
        <div className="row">
          <a href={`/p/${slug}`} className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element -- small static logo, no next/image config needed */}
            <img src="/logo-mark.webp" alt="" width={32} height={32} className="brand-mark" />
            <span className="brand-text">
              <span className="name">Anniymah</span>
              <span className="tag">premium perfume combo</span>
            </span>
          </a>
        </div>
      </header>

      <main className="thank-you-wrap">
        <div className="thank-you-card">
          <div className="check-badge">
            <span className="check-glow" />
            <svg viewBox="0 0 64 64">
              <circle className="check-circle" cx="32" cy="32" r="28" pathLength={100} />
              <path className="check-mark" d="M20 33.5 28 41.5 45 24" pathLength={100} />
            </svg>
          </div>

          <h1>অর্ডার কনফার্ম হয়েছে!</h1>
          <p className="sub">আমরা শীঘ্রই যোগাযোগ করব।</p>

          {(name || total) && (
            <div className="thank-you-summary">
              {name && (
                <div className="row">
                  <span>Name</span>
                  <span>{name}</span>
                </div>
              )}
              {total && (
                <div className="row">
                  <span>Total</span>
                  <span>৳{total}</span>
                </div>
              )}
            </div>
          )}

          <a href={`/p/${slug}`} className="btn btn-primary btn-block">
            Back to homepage
          </a>

          {landing.phone && (
            <p className="thank-you-contact">
              সরাসরি কথা বলতে চান? কল করুন — <a href={`tel:${landing.phone}`}>{landing.phone}</a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
