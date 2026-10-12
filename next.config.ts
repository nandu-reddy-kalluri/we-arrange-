import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,

  images: {
    qualities: [70, 75, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

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
};

export default nextConfig;
