import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.1.106", "192.168.1.79", "192.168.1.72"],
};

export default nextConfig;
