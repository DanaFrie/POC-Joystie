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
          }),
          // Fix for encoding module warning
          new webpack.IgnorePlugin({
            resourceRegExp: /^encoding$/,
            contextRegExp: /node_modules\/node-fetch/,
          })
        );
      }
      
      // Fix encoding module resolution for server-side
      if (isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          encoding: false,
        };
      }
    
    return config;
  },
  // Disable server-side rendering for pages that use tesseract.js
  experimental: {
    serverComponentsExternalPackages: ['tesseract.js'],
  },
  // Exclude functions directory from TypeScript checking (it has its own tsconfig)
  typescript: {
    ignoreBuildErrors: false, // We want to catch real errors
  },
  // Exclude functions directory from being processed by Next.js
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
};

module.exports = nextConfig;

