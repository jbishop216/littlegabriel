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
    
    // Create a response with a custom cookie as a fallback mechanism
    const response = NextResponse.json({
      success: true,
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
        }
      } : null,
      fallbackAuth: authenticated === 'true',
    });
    
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
