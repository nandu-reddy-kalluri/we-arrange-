import type { NextConfig } from "next";
import path from "node:path";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname, "../../"),
  experimental: {
    optimizePackageImports: ["lucide-react"],
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
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "image.wedmegood.com",
      },
    ],
  },
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
