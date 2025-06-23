/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  
  // Environment variables available to the client
  env: {
    OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
    NEXT_PUBLIC_DEPLOYMENT_MODE: process.env.NODE_ENV || 'production',
    FORCE_OPENAI_ASSISTANT: 'true',
    NEXT_PUBLIC_SITE_PASSWORD_PROTECTION: process.env.SITE_PASSWORD_PROTECTION || 'true',
    BUILD_TIMESTAMP: Date.now().toString(),
  },
  
  // Skip static generation for problematic routes
  experimental: {
    workerThreads: true,
    cpus: 4
  },
  
  // Production optimizations
  reactStrictMode: !isProd, // Disable strict mode in production
  poweredByHeader: false,   // Remove the powered by header in production
  
  // Ensure these paths get included in the build
  transpilePackages: ['next-auth'],
  
  // Generate a standalone output for deployment
  output: 'standalone',
  
  // Build optimizations
  typescript: {
    ignoreBuildErrors: isProd, // Skip TypeScript errors in production
  },
  eslint: {
    ignoreDuringBuilds: isProd, // Skip ESLint errors in production
  },
  
  // Configure webpack for compatibility
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
  
  // Image optimization settings
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Optimize output for deployment
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
  experimental: {},
};

module.exports = nextConfig;
