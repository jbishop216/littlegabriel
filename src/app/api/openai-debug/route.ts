/**
 * Debug endpoint for OpenAI API
 * This helps diagnose issues with OpenAI API in deployed environments
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/openai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import OpenAI from 'openai';

export async function GET() {
  try {
    // Check session (only allow admins)
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get environment information
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    
    // Collect debug info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyStart: apiKey ? `${apiKey.substring(0, 3)}...` : 'undefined',
      assistantId,
      assistantIdSource: process.env.OPENAI_ASSISTANT_ID ? 'environment' : 'fallback',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
      deploymentMode: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'Not set',
    };
    
    // Test OpenAI API connectivity
    let completionTest;
    let assistantTest;
    
    try {
      console.log('Creating OpenAI client with API key info:', { 
        keyPresent: !!apiKey, 
        keyLength: apiKey?.length || 0,
        keyStart: apiKey ? apiKey.substring(0, 5) : 'none'
      });
      
      console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
        isReplitProduction: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'production'
      });
      
      // Create OpenAI client (using our helper function)
      const openai = createClient();
      
      // Test basic API connectivity
      console.log('Testing basic OpenAI API with simple completion...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 10
      });
      
      completionTest = {
        success: true,
        content: completion.choices[0].message.content,
      };
      
      // Test Assistant API connectivity
      console.log(`Testing Assistant API with ID: ${assistantId}`);
      try {
        const assistantInfo = await openai.beta.assistants.retrieve(assistantId);
        
        assistantTest = {
          success: true,
          name: assistantInfo.name,
          model: assistantInfo.model,
          created: new Date(assistantInfo.created_at * 1000).toLocaleString(),
        };
      } catch (assistantError: any) {
        console.error('Error retrieving assistant:', assistantError);
        assistantTest = {
          success: false,
          error: assistantError.message || String(assistantError),
          status: assistantError.status || 'unknown',
        };
      }
    } catch (openaiError: any) {
      console.error('Error in OpenAI API test:', openaiError);
      completionTest = {
        success: false,
        error: openaiError.message || String(openaiError),
        status: openaiError.status || 'unknown',
      };
    }
    
    // Return all diagnostic information
    return NextResponse.json({
      environment: envInfo,
      completionTest,
      assistantTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in openai-debug API:', error);
    return NextResponse.json(
      { error: `Error testing OpenAI API: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
