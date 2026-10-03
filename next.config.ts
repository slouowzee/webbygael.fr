import type { NextConfig } from "next";
import { site } from "./src/lib/site";

const host = new URL(site.url).hostname;

const umami = process.env.UMAMI_SCRIPT_URL ? new URL(process.env.UMAMI_SCRIPT_URL).origin : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${umami}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' ${umami}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
  redirects: async () => [{ source: "/:path*", has: [{ type: "host", value: `www.${host}` }], destination: `${site.url}/:path*`, permanent: true }],
};

export default nextConfig;
