import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@we-arrange/auth",
    "@we-arrange/database",
    "@we-arrange/design-system",
    "@we-arrange/types",
    "@we-arrange/ui",
    "@we-arrange/utils",
  ],
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
};

export default nextConfig;
