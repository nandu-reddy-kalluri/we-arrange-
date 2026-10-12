import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
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
        source: "/concierge-portal/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;
