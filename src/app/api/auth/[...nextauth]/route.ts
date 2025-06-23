import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Only set a dummy URL during build time to prevent 'Invalid URL' errors
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

if (isBuildTime) {
  // During build time, use a safe dummy URL to prevent 'Invalid URL' errors
  process.env.NEXTAUTH_URL = 'https://example.com';
  console.log('Build-time detected in NextAuth route, using safe dummy NEXTAUTH_URL');
}

// Log auth configuration (for debugging only)
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth Configuration:', {
    secret: process.env.NEXTAUTH_SECRET ? 'present (hidden)' : 'missing',
    url: process.env.NEXTAUTH_URL || 'not set',
  });
}

// Use the standard auth options
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
