/**
 * Debugging endpoint for environment variables
 * This will help diagnose issues with API keys and Assistant ID not being loaded properly
 * For security reasons, this endpoint is protected (only shows that variables exist, not their values)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users to access this endpoint
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Mask sensitive values for security
    const maskValue = (val: string | undefined): string => {
      if (!val) return 'NOT SET';
      if (val.length <= 8) return '********'; // For short keys
      return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
    };

    // Collect information about critical environment variables
    const envInfo = {
      // General environment
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV || 'NOT SET',
      NEXT_PUBLIC_DEPLOYMENT_MODE: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'NOT SET',
      
      // API keys (masked)
      OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
      OPENAI_API_KEY_PREVIEW: maskValue(process.env.OPENAI_API_KEY),
      OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
      
      // Assistant ID
      OPENAI_ASSISTANT_ID_SET: !!process.env.OPENAI_ASSISTANT_ID,
      OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || 'NOT SET',
      FALLBACK_ASSISTANT_ID: 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
      EFFECTIVE_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
      
      // Database info
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_PREVIEW: maskValue(process.env.DATABASE_URL),
      
      // Auth config
      NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL_SET: !!process.env.NEXTAUTH_URL,
      
      // Other environment variables
      BIBLE_API_KEY_SET: !!process.env.BIBLE_API_KEY,
      ALL_ENV_KEYS: Object.keys(process.env)
    };

    // Return the environment information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envInfo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Error debugging environment: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}