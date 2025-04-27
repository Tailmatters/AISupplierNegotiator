/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
  eslint: {
    // Disable during development for faster iterations
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable during development for faster iterations
    ignoreBuildErrors: true,
  },
};

export default nextConfig;