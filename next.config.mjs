/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Auth.js + browser bundle aligned with a single public URL (no localhost in source).
  env: {
    NEXTAUTH_URL: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "",
  },
  images: { remotePatterns: [{ hostname: "**.vercel-storage.com", protocol: "https" }] },
  experimental: { serverComponentsExternalPackages: ["@neondatabase/serverless"] },
};

export default nextConfig;
