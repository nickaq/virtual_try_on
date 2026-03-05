import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ['winston'],
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/ai-service/**', '**/node_modules/**'],
    };
    return config;
  },
  async rewrites() {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    return [
      {
        source: '/results/:path*',
        destination: `${aiServiceUrl}/results/:path*`,
      },
    ];
  },
};

export default nextConfig;
