/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'housinganywhere.imgix.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'listingimages.wunderflats.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pic.le-cdn.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Performance optimizations
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Enable SWC minification for better performance
  swcMinify: true,
  // Optimize CSS
  optimizeFonts: true,
  // Aggressive no-cache for development - always fresh content
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Accel-Expires',
            value: '0',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
