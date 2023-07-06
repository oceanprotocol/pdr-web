/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GREETING: process.env.NEXT_PUBLIC_WC2_PROJECT_ID
  }
}

module.exports = nextConfig
