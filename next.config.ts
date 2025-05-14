// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.API_BASE_URL,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // 307 Temporary Redirect
      },
    ];
  },
};

module.exports = nextConfig;
