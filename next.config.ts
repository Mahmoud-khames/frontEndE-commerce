import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // استخدام output: 'standalone' بدلاً من 'export'
  output: 'standalone',
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
};

export default nextConfig;





