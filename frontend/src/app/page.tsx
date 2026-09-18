import { getLandingPage } from "@/lib/db";
import { LandingHeader } from "@/components/LandingHeader";
import { OrderForm } from "@/components/OrderForm";
import "./landing.css";

export const dynamic = "force-dynamic";

const ICON_COLORS = ["#6B8F71", "#2E2A25", "#D98C86", "#8A8175"];

function BottleIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" width="26" height="26" fill="none" stroke={color} strokeWidth="4">
      <rect x="24" y="20" width="16" height="30" rx="2" />
      <rect x="27" y="12" width="10" height="9" rx="2" />
    </svg>
  );
}

export default async function Home() {
  const landing = await getLandingPage();
  const part2Items = landing.part2Text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="landing-body">
      <LandingHeader />

      <main className="container" id="top">
        <section className="hero">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">কম্বো অফার</p>
              <h1>{landing.title}</h1>
              <p className="lead">{landing.description}</p>
              <a href="#order" className="btn btn-primary">
                Order now
              </a>
              {landing.phone && (
                <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--muted)" }}>
                  সরাসরি কথা বলতে চান? কল করুন —{" "}
                  <a href={`tel:${landing.phone}`} style={{ color: "var(--sage-dark)", fontWeight: 600 }}>
                    {landing.phone}
                  </a>
                </p>
              )}
            </div>
            <div className="hero-visual">
              {landing.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local path, no remote domain to configure
                <img
                  src={landing.imageUrl}
                  alt={landing.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: 13, color: "var(--muted)" }}>প্রোডাক্ট ছবি শীঘ্রই যুক্ত হবে</span>
              )}
            </div>
          </div>
        </section>

        {landing.part2Enabled && (
          <section className="section" id="inside">
            <div className="section-head">
              <h2>{landing.part2Title}</h2>
            </div>
            <div className="inside-grid">
              <div className="pdp-media" style={{ height: "auto", overflow: "hidden" }}>
                {landing.part2ImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded local path, no remote domain to configure
                  <img
                    src={landing.part2ImageUrl}
                    alt={landing.part2Title}
                    style={{ width: "100%", display: "block" }}
                  />
                ) : (
                  <span style={{ fontSize: 13, color: "var(--muted)", padding: 40 }}>ছবি শীঘ্রই যুক্ত হবে</span>
                )}
              </div>
              <div className="inside-list">
                {part2Items.map((item, i) => (
                  <div className="inside-item" key={item}>
                    <div className="inside-icon">
                      <BottleIcon color={ICON_COLORS[i % ICON_COLORS.length]} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section" id="order-section-wrap">
          <div className="section-head">
            <h2>Place your order</h2>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 24, maxWidth: 520 }}>
            নিচের ফর্মটি পূরণ করে Confirm করুন — আপনার অর্ডারটি সরাসরি আমাদের কাছে চলে যাবে। ক্যাশ অন ডেলিভারিতে পেমেন্ট করবেন।
          </p>
          <OrderForm price={landing.price} />
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
            <span>© {new Date().getFullYear()} An Niymah. All rights reserved.</span>
            {landing.phone && <span>Inbox or call: {landing.phone}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}
