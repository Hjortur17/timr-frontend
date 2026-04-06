import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "tailwindcss.com", pathname: "/plus-assets/**" },
      { hostname: "ui-avatars.com", pathname: "/**" },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
