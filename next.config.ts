import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Remove distDir for Vercel deployment
  // distDir: 'build',
  
  // Remove basePath for Vercel deployment or adjust it
  // basePath: process.env.NODE_ENV === 'production' ? '/frontEndE-commerce' : '',
  
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
    return process.env.BUILD_ID || 'your-custom-build-id'
  },
  // Add this to handle 404 errors
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;


