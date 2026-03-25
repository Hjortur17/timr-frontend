import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "tailwindcss.com", pathname: "/plus-assets/**" },
      { hostname: "ui-avatars.com", pathname: "/**" },
    ],
  },
  redirects: () => [
    {
      source: "/",
      destination: "/login",
      permanent: false,
    },
  ],
  reactCompiler: true,
};

export default nextConfig;
