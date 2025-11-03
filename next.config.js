/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GREETING: process.env.NEXT_PUBLIC_WC2_PROJECT_ID
  },
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    '@rainbow-me/rainbowkit-wallets',
    '@vanilla-extract/css',
    '@vanilla-extract/sprinkles',
    '@vanilla-extract/dynamic'
  ],
        webpack: (config, { isServer }) => {
          config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader'
          })

          // Fix for CommonJS/ESM compatibility issues
          config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
          }

          // Fix for MetaMask SDK trying to import React Native dependencies
          // Ignore React Native modules when building for web
          config.resolve.alias = {
            ...config.resolve.alias,
            '@react-native-async-storage/async-storage': false,
          }

          return config
        }
}

module.exports = nextConfig
