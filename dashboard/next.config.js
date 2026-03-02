/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  // Allow API routes to use the native pg binary without bundling through webpack
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
};

module.exports = nextConfig;
