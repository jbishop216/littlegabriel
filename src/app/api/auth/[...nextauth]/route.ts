import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Force environment variables for local development
const isDevelopment = process.env.NODE_ENV === 'development';

// Override NEXTAUTH_URL for local development
if (isDevelopment) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  console.log('Forced NEXTAUTH_URL to', process.env.NEXTAUTH_URL);
}

// Create modified auth options for local development
const localAuthOptions = {
  ...authOptions,
  // Force these options for local development to override any env vars
  // Using the same secret from environment - this is critical for JWT consistency
  url: 'http://localhost:3000', // Force URL directly in options
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as "lax", // Fix TypeScript error by specifying correct type
        path: '/',
        secure: false, // Allow non-HTTPS locally
        domain: 'localhost', // Force localhost domain
      },
    },
  }
};

// Log auth configuration
console.log('NextAuth Configuration:', {
  secret: 'present (hidden)',
  url: process.env.NEXTAUTH_URL || 'not set',
  forceLocalhost: true,
});

// Use the modified options for local development
const handler = NextAuth(localAuthOptions);
export { handler as GET, handler as POST };
