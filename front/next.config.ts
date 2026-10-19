/** @type {import('nex-t').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.API_URL,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
       	protocol: 'http',
        hostname: '192.168.0.10',
        port: '8001',
        pathname: '/media/Imagenes/**',
      },
      {
       	protocol: 'http',
        hostname: '128.0.204.34',
        port: '8001',
        pathname: '/media/Imagenes/**',
      },
      {
       	protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/media/Imagenes/**',
      }
    ],
  },
};

module.exports = nextConfig;
