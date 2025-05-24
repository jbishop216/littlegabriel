/** 
 * @type {import('next').NextConfig} 
 * Special configuration for deployment builds
 */
const nextConfig = {
  // Disable strict mode for production to avoid double-rendering issues
  reactStrictMode: false,
  
  // Remove the powered by header
  poweredByHeader: false,

  // Skip TypeScript checks for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint checks for faster builds  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable experimental features that aid in deployment
  experimental: {
    // Optimize output for deployment
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
  
  // Configure webpack for deployment
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
    };
    
    return config;
  },
  
  // Ensure that environment variables are properly exposed for client
  env: {
    // The assistant ID is critical for functionality
    OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || '',
    
    // Add timestamp to help with cache busting
    BUILD_TIMESTAMP: Date.now().toString(),
  },
  
  // Configure image optimization
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Generate a standalone output
  output: 'standalone',
};

module.exports = nextConfig;