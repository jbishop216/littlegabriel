import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Log the request URL for debugging
  console.log(`Middleware processing: ${request.url}`);
  
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes and auth routes
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  ) {
    return NextResponse.next();
  }

  try {
    // Check for our direct auth token first
    const directAuthToken = request.cookies.get('gabriel-auth-token');
    const siteAuthCookie = request.cookies.get('gabriel-site-auth');
    
    // Log all cookies for debugging in production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
    if (isProduction) {
      console.log('All cookies in middleware:', request.cookies.getAll());
      console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    }
    
    if (directAuthToken || siteAuthCookie) {
      console.log(`Auth token found for ${pathname}: directAuth=${!!directAuthToken}, siteAuth=${!!siteAuthCookie}`);
      return NextResponse.next();
    }
    
    // Then check for NextAuth token as fallback
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Log token information for debugging
    console.log(`Token check for ${pathname}:`, token ? 'NextAuth token exists' : 'No tokens found');
    
    // Allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
