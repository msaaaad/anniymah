import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Browser calls go to /backend/* on this origin and are forwarded to the
  // NestJS API, so the session cookie stays same-origin (no CORS, no
  // cross-site cookie rules).
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
