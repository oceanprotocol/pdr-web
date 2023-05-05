/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GREETING: process.env.WC2_PROJECT_ID,
  }
}

module.exports = nextConfig
