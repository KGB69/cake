/** @type {import('next').NextConfig} */
const nextConfig = {
  // Specify the output directory for production builds
  distDir: 'build',
  
  // Removed static export to enable API routes
  // API routes don't work with static export
  
  // Other Next.js configurations
  reactStrictMode: true,
  
  // Image optimization settings
  images: {
    domains: ['localhost'],
  }
};

module.exports = nextConfig;
