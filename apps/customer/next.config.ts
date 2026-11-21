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
    "@we-arrange/service-customer",
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
        hostname: "image.wedmegood.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.youmarriagewearrange.com",
      },
      {
        protocol: "https",
        hostname: "youmarriagewearrange.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/overview",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
      {
        source: "/customer/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
