import type { NextConfig } from "next";

const NGINX_URL = process.env.NGINX_URL || "http://localhost:80";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${NGINX_URL}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${NGINX_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
