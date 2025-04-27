/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensures standalone output for deployment
  output: 'standalone',
  
  // Enable server actions
  experimental: {
    serverActions: true,
  },
  
  // Redirect the root to the dashboard
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;