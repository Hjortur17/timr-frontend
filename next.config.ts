import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "tailwindcss.com", pathname: "/plus-assets/**" },
      { hostname: "ui-avatars.com", pathname: "/**" },
    ],
  },
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
