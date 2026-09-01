import type { NextConfig } from "next";

// Vercel runs Next.js natively — do not use output:"standalone" there.
// For Docker/VPS deploys, set STANDALONE=1 when building.
const useStandalone =
  process.env.STANDALONE === "1" && process.env.VERCEL !== "1";

const nextConfig: NextConfig = {
  ...(useStandalone ? { output: "standalone" as const } : {}),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
