import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Remove 'standalone' output for Vercel deployment
  // output: 'standalone',
  distDir: 'build',
  basePath: process.env.NODE_ENV === 'production' ? '/frontEndE-commerce' : '',
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
    
    // Add path aliases for hooks
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib')
    };
    
    return config;
  },
  generateBuildId: async () => {
    // You can use a git hash or any other consistent identifier
    return process.env.BUILD_ID || 'your-custom-build-id'
  },
};

export default nextConfig;






