/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for tesseract.js - it's a client-side only library
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Ignore tesseract.js during server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('tesseract.js');
    }
    
    return config;
  },
  // Disable server-side rendering for pages that use tesseract.js
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
};

module.exports = nextConfig;

