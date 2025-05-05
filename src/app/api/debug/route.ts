import { NextResponse } from 'next/server';

/**
 * Debug API endpoint to check environment variables and configuration
 * Only for development use - should be disabled in production
 */
export async function GET() {
  // Get environment information (don't include actual API keys)
  const envInfo = {
    // OpenAI configuration (only include presence, not actual values)
    openai: {
      apiKeyPresent: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      apiKeyFirstChars: process.env.OPENAI_API_KEY?.substring(0, 5) || 'none',
      assistantIdPresent: !!process.env.OPENAI_ASSISTANT_ID,
    },
    
    // Environment indicators
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    },
    
    // Other configuration
    config: {
      disableParallelRoutePrerendering: !!process.env.NEXT_DISABLE_PARALLEL_ROUTE_PRERENDERING,
    },
  };
  
  // Return environment information
  return NextResponse.json(envInfo);
}