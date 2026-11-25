import type { NextConfig } from "next";
import path from "node:path";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.wedmegood.com" },
      { protocol: "https", hostname: "*.youmarriagewearrange.com" },
      { protocol: "https", hostname: "youmarriagewearrange.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  transpilePackages: [
    "@we-arrange/api-client",
    "@we-arrange/auth",
    "@we-arrange/database",
    "@we-arrange/design-system",
    "@we-arrange/types",
    "@we-arrange/ui",
    "@we-arrange/utils",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/concierge-portal/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/concierge-portal/:path*",
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
