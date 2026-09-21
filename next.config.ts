import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/hi2",
      "react-icons/fa6",
      "react-icons/rx",
      "react-icons/lu",
    ],
  },
};

export default nextConfig;
