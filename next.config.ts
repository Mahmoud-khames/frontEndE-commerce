import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    domains: ["via.placeholder.com", "images.pexels.com", "localhost"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    config.resolve.symlinks = false;
    
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
    };
    
    return config;
  },
  generateBuildId: async () => {
    return process.env.BUILD_ID || "your-custom-build-id";
  },
  // Add this to handle 404 errors properly for Vercel deployments
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en', // Default locale
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
