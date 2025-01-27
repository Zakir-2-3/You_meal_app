import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'burgerkings.ru',
        port: '',
        pathname: '/image/**',
      },
    ],
  },
};

export default nextConfig;
