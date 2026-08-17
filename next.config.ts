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

  webpack(config) {
    // Находим стандартное правило file-loader для SVG (Next.js добавляет его сам)
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test instanceof RegExp && rule.test.test(".svg"),
    );

    // Отключаем стандартное правило для всех SVG — будем управлять сами
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // все SVG становятся обычными URL (как статические ресурсы)
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      type: "asset/resource",
    });

    return config;
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["http://localhost:3000"],
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
              "font-src 'self' fonts.gstatic.com; " +
              "img-src 'self' data: https: blob:; " +
              "connect-src 'self' https://hxkhkagppruuaudgtbwt.supabase.co https://6794c225aad755a134ea56b6.mockapi.io https://nominatim.openstreetmap.org https://open.er-api.com; " +
              "frame-ancestors 'none';",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
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
