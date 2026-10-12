import type { NextConfig } from "next";

const CUSTOMER_APP_URL = process.env.CUSTOMER_APP_URL || "http://localhost:3001";
const CONCIERGE_APP_URL = process.env.CONCIERGE_APP_URL || "http://localhost:3004";
const VENDOR_APP_URL = process.env.VENDOR_APP_URL || "http://localhost:3002";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    qualities: [70, 75, 90, 95, 100],
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
        source: "/customer/:path*",
        destination: `${CUSTOMER_APP_URL}/:path*`,
      },
      {
        source: "/concierge-portal/:path*",
        destination: `${CONCIERGE_APP_URL}/:path*`,
      },
      {
        source: "/vendor/:path*",
        destination: `${VENDOR_APP_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
