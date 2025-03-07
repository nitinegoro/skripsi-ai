/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/skripsi-ai/' : '',
  basePath: isProd ? '/skripsi-ai' : '',
  output: 'export'
};

module.exports = nextConfig