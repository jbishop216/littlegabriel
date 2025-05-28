import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { encode } from 'next-auth/jwt';

/**
 * Direct login API that bypasses NextAuth for Vercel deployments
 * This is a workaround for NextAuth session issues in Vercel
 */
export async function POST(request: NextRequest) {
  try {
    // Get the credentials from the request
    const data = await request.json();
    const { email, password } = data;
    
    // Log the login attempt for debugging
    console.log('Direct login attempt:', { email });
    
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { status: 400 });
    }
    
    // Find the user with case-insensitive email lookup
    const emailLowerCase = email.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: emailLowerCase,
        }
      },
    });
    
    // Check if user exists
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'No user found with this email' 
      }, { status: 401 });
    }
    
    // Check if user has a password
    if (!user.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'User has no password set' 
      }, { status: 401 });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid password' 
      }, { status: 401 });
    }
    
    // Create a custom token that mimics NextAuth JWT
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret',
    });
    
    // Create a successful response
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
    
    // Set cookies for authentication
    response.cookies.set('gabriel-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    response.cookies.set('gabriel-auth-user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }), {
      httpOnly: false, // Allow JavaScript access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    // Also set the gabriel-site-auth cookie for compatibility with existing auth
    response.cookies.set('gabriel-site-auth', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Direct login error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred during login' 
    }, { status: 500 });
  }
}
