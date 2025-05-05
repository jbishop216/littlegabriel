import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY || 'Not Set';
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'Not Set';
    
    // Extract environment information
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      apiKeyFirstChars: apiKey.substring(0, 10) + '...',
      apiKeyLastChars: apiKey.substring(apiKey.length - 4),
      apiKeyLength: apiKey.length,
      assistantId,
      isProduction: process.env.NODE_ENV === 'production',
      serverTime: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      environment: envInfo,
    });
  } catch (error: any) {
    console.error('Error in check-env-vars:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Unknown error',
      }
    }, { status: 500 });
  }
}