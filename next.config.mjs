/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ hostname: "**.vercel-storage.com", protocol: "https" }] },
  experimental: { serverComponentsExternalPackages: ["@neondatabase/serverless"] },
};

export default nextConfig;
