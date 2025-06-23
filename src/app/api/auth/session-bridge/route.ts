import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * This route handler helps bridge authentication between client and server
 * It's particularly useful for Vercel deployments where cookie handling can be tricky
 */
export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const authenticated = formData.get('authenticated') as string;
    
    // Log the request for debugging
    console.log('Session bridge request:', { email, authenticated });
    
    // Check if we have a valid session
    const session = await getServerSession(authOptions);
    
    // Create a redirect response to the home page
    // Safe URL construction with fallback for build-time
    let redirectUrl;
    try {
      redirectUrl = new URL('/', request.url);
    } catch (e) {
      // During build/SSG, request.url might not be a valid URL
      // Use absolute URL as fallback
      redirectUrl = new URL('/', 'https://example.com');
    }
    const response = NextResponse.redirect(redirectUrl);
    
    // Add authentication info to the response headers for debugging
    response.headers.set('X-Auth-Status', 'success');
    if (session?.user?.email) {
      response.headers.set('X-Auth-Email', session.user.email);
    }
    
    // Set the cookie in the response headers
    if (authenticated === 'true' && email) {
      response.cookies.set('gabriel-auth-email', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day
      });
    }
    
    return response;
  } catch (error) {
    console.error('Session bridge error:', error);
    return NextResponse.json({ success: false, error: 'Session bridge error' }, { status: 500 });
  }
}
