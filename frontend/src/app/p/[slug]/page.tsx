import { notFound } from "next/navigation";
import { getLandingPageBySlug } from "@/lib/db";
import { LandingHeader } from "@/components/LandingHeader";
import { OrderForm } from "@/components/OrderForm";
import "../../landing.css";

export const dynamic = "force-dynamic";

const FEATURE_ICONS = [
  // Droplet — volume/size
  <svg key="drop" viewBox="0 0 64 64" width="28" height="28" fill="none" stroke="var(--sage-dark)" strokeWidth="3">
    <path d="M32 10c0 0-15 19-15 30a15 15 0 0 0 30 0c0-11-15-30-15-30Z" />
  </svg>,
  // Clock — longevity
  <svg key="clock" viewBox="0 0 64 64" width="28" height="28" fill="none" stroke="var(--sage-dark)" strokeWidth="3">
    <circle cx="32" cy="32" r="21" />
    <path d="M32 20v12l9 9" strokeLinecap="round" />
  </svg>,
  // Box — packaging
  <svg key="box" viewBox="0 0 64 64" width="28" height="28" fill="none" stroke="var(--sage-dark)" strokeWidth="3">
    <rect x="11" y="25" width="42" height="27" rx="2" />
    <path d="M11 34h42M32 25v27M22 25l6-9h8l6 9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
  // Star — quality
  <svg key="star" viewBox="0 0 64 64" width="28" height="28" fill="var(--sage-dark)" stroke="none">
    <path d="M32 8l7.5 16.5L57 27l-13 12.5L47.5 57 32 47.5 16.5 57 20 39.5 7 27l17.5-2.5Z" />
  </svg>,
];

export default async function LandingPageBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const landing = await getLandingPageBySlug(slug);
  if (!landing) notFound();

  const collectionItems = landing.collectionItems.filter((item) => item.name.trim());
  const features = landing.features.filter((item) => item.title.trim());
  const shippingItems = landing.shippingBarItems.map((item) => item.trim()).filter(Boolean);

  return (
    <div className="landing-body">
      <LandingHeader />

      <main id="top">
        <section className="hero section-premium">
          <div className="container">
            <div className="hero-grid">
              <div>
                <p className="eyebrow">কম্বো অফার</p>
                <h1>{landing.title}</h1>
                <p className="lead">{landing.description}</p>
                <div className="price-row">
                  {landing.regularPrice > landing.price && (
                    <span className="price-old">৳{landing.regularPrice}</span>
                  )}
                  <span className="price-current">৳{landing.price}</span>
                </div>
                <a href="#order" className="btn btn-primary">
                  Order now
                </a>
                {landing.phone && (
                  <p className="hero-contact">
                    সরাসরি কথা বলতে চান? কল করুন —{" "}
                    <a href={`tel:${landing.phone}`}>{landing.phone}</a>
                  </p>
                )}
              </div>
              <div className="hero-visual floaty">
                {landing.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- image lives in Supabase Storage, not a domain we control for next/image config
                  <img
                    src={landing.imageUrl}
                    alt={landing.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 13, color: "var(--sage-tint)", opacity: 0.6 }}>প্রোডাক্ট ছবি শীঘ্রই যুক্ত হবে</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {landing.featuresEnabled && features.length > 0 && (
          <section className="section" id="features">
            <div className="container">
              <div className="section-head stack">
                <h2>{landing.featuresTitle}</h2>
                {landing.featuresSubtitle && <p>{landing.featuresSubtitle}</p>}
              </div>
              <div className="feature-grid">
                {features.map((feature, i) => (
                  <div className="feature-card" key={feature.title}>
                    <div className="feature-icon">{FEATURE_ICONS[i % FEATURE_ICONS.length]}</div>
                    <div>
                      <h3>{feature.title}</h3>
                      {feature.description && <p>{feature.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {landing.collectionEnabled && collectionItems.length > 0 && (
          <section className="section section-premium" id="inside">
            <div className="container">
              <div className="section-head">
                <h2>{landing.collectionTitle}</h2>
              </div>
              <div className="collection-grid">
                {collectionItems.map((item) => (
                  <div className="collection-card" key={item.name}>
                    <div className="collection-media">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- image lives in Supabase Storage, not a domain we control for next/image config
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--sage-tint)", opacity: 0.6 }}>ছবি নেই</span>
                      )}
                    </div>
                    <div className="collection-body">
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {landing.shippingBarEnabled && shippingItems.length > 0 && (
          <section>
            <div className="container">
              <div className="shipping-bar">
                {shippingItems.map((item) => (
                  <span key={item} className="shipping-bar-item">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section" id="order-section-wrap">
          <div className="container">
            <div className="section-head">
              <h2>Place your order</h2>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24, maxWidth: 520 }}>
              নিচের ফর্মটি পূরণ করে Confirm করুন — আপনার অর্ডারটি সরাসরি আমাদের কাছে চলে যাবে। ক্যাশ অন ডেলিভারিতে পেমেন্ট করবেন।
            </p>
            <OrderForm
              landingPageId={landing.id}
              slug={slug}
              price={landing.price}
              freeDelivery={landing.freeDelivery}
              deliveryChargeInsideDhaka={landing.deliveryChargeInsideDhaka}
              deliveryChargeOutsideDhaka={landing.deliveryChargeOutsideDhaka}
            />
          </div>
        </section>
      </main>

      <div className="sticky-cta">
        <a href="#order" className="btn btn-primary btn-block">
          Order now — ৳{landing.price}
        </a>
      </div>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Anniymah. All rights reserved.</span>
            {landing.phone && <span>Inbox or call: {landing.phone}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
