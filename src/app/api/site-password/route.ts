
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const sitePassword = process.env.SITE_PASSWORD;
    const sitePasswordHash = process.env.SITE_PASSWORD_HASH;
    
    if (!sitePassword && !sitePasswordHash) {
      return NextResponse.json({ error: 'Site password not configured' }, { status: 500 });
    }

    // First try direct comparison (for backward compatibility)
    let isValid = false;
    
    if (sitePassword && password === sitePassword) {
      isValid = true;
    } 
    // Then try bcrypt comparison if hash is available
    else if (sitePasswordHash) {
      isValid = await bcrypt.compare(password, sitePasswordHash);
    }
    
    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ error: 'Failed to verify password' }, { status: 500 });
  }
}
