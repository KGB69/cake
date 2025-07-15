/** @type {import('next').NextConfig} */
const nextConfig = {
  // Specify the output directory for production builds
  distDir: 'build',
  
  // Enable static exports if needed
  output: 'export',

  // Other Next.js configurations
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization settings
  images: {
    unoptimized: true, // Required for static export
    domains: ['localhost'],
  }
};

module.exports = nextConfig;
