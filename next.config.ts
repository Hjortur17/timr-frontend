import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
