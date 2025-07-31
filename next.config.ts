import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "burgerkings.ru",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "hxkhkagppruuaudgtbwt.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["http://localhost:3000"],
    },
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXTAUTH_URL || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
};

export default nextConfig;
