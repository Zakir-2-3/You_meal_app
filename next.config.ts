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
    /**
     * 1. Находим стандартный loader Next.js,
     *    который обрабатывает картинки (png, jpg, svg и т.д.)
     */
    const fileLoaderRule = config.module.rules.find(
      (rule: any) => rule.test instanceof RegExp && rule.test.test(".svg"),
    );

    /**
     * 2. SVG как React-компонент
     *    Работает ТОЛЬКО если импорт с ?component
     */
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      // resourceQuery: /component/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false, // чтобы width/height работали
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });

    /**
     * 3. Исключаем SVG из стандартного file-loader'а
     */
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    /**
     * 4. Все остальные SVG — как обычные файлы (URL)
     */
    config.module.rules.push({
      test: /\.svg$/i,
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
