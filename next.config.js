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
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    
    // Ignore tesseract.js during server-side rendering
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('tesseract.js');
    }
    
    // Fix for Firebase - ignore Node.js specific modules in client bundle
    if (!isServer) {
      // Use IgnorePlugin to ignore Node.js modules that Firebase tries to import
      const webpack = require('webpack');
      if (!config.plugins) {
        config.plugins = [];
      }
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^undici$/,
          contextRegExp: /node_modules\/firebase/,
        })
      );
    }
    
    return config;
  },
  // Disable server-side rendering for pages that use tesseract.js
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
};

module.exports = nextConfig;

