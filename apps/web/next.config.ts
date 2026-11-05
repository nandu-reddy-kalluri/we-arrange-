import type { NextConfig } from "next";

const CUSTOMER_APP_URL = process.env.CUSTOMER_APP_URL || "http://localhost:3001";
const CONCIERGE_APP_URL = process.env.CONCIERGE_APP_URL || "http://localhost:3004";
const VENDOR_APP_URL = process.env.VENDOR_APP_URL || "http://localhost:3002";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75, 80, 85, 90, 95, 100],
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
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
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
    "@we-arrange/service-booking",
    "@we-arrange/service-customer",
    "@we-arrange/service-vendor",
    "@we-arrange/service-venue",
    "@we-arrange/types",
    "@we-arrange/ui",
    "@we-arrange/utils",
    "@we-arrange/validation",
  ],
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/customer/overview",
        permanent: false,
      },
      {
        source: "/customer",
        destination: "/customer/overview",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/vendor/:path*",
        destination: `${VENDOR_APP_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
