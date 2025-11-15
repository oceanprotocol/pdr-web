import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    '@wagmi/connectors',
    'wagmi',
  ],

  webpack: (config) => {
    // Ignore problematic files from thread-stream package
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    // Add rule to ignore test files and other non-source files
    config.module.rules.push({
      test: /node_modules\/thread-stream\/(test|bench\.js|README\.md|LICENSE)/,
      use: 'null-loader'
    });

    // Fallback configuration for imports
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };

    return config;
  },
};

export default nextConfig;
