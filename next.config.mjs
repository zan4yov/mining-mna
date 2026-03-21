/** @type {import('next').NextConfig} */
const nextConfig = {
  // next-auth/react reads NEXTAUTH_URL at build time; Auth.js uses AUTH_URL — keep them aligned
  env: {
    NEXTAUTH_URL: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "",
  },
  images: { remotePatterns: [{ hostname: "**.vercel-storage.com", protocol: "https" }] },
  experimental: { serverComponentsExternalPackages: ["@neondatabase/serverless"] },
};

export default nextConfig;
