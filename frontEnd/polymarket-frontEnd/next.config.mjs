/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  },
  async rewrites() {
    // Proxy /api requests to backend during development
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*` : 'http://localhost:3000/api/:path*'
      }
    ];
  }
};

export default nextConfig;
