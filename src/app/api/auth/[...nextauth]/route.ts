import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simple export of NextAuth handler with authOptions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
