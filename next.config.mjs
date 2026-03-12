/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dl.airtable.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
