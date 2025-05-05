import { NextResponse } from 'next/server';
import { createClient } from '@/lib/openai';
import OpenAI from 'openai';

/**
 * Test endpoint to validate OpenAI API key and connectivity
 * This endpoint should only be used during development and testing
 */
export async function GET() {
  try {
    // Get environment information about the API key
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    
    // Log the Assistant ID for debugging
    console.log('Using Assistant ID:', assistantId);
    
    // Environment details for debugging
    const envInfo = {
      keyPresent: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyStart: apiKey ? apiKey.substring(0, 5) : 'none',
      assistantIdPresent: !!assistantId,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    };
    
    // Test basic OpenAI API connectivity with a simple completion
    let completionTest;
    let assistantTest;
    
    try {
      // Create OpenAI client (using our helper function)
      const openai = createClient();
      
      // Test basic API connectivity with a simple completion
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
      try {
        const assistantInfo = await openai.beta.assistants.retrieve(assistantId);
        
        assistantTest = {
          success: true,
          name: assistantInfo.name,
          model: assistantInfo.model,
        };
      } catch (assistantError: any) {
        assistantTest = {
          success: false,
          error: assistantError.message || String(assistantError),
        };
      }
    } catch (openaiError: any) {
      completionTest = {
        success: false,
        error: openaiError.message || String(openaiError),
      };
    }
    
    // Return all the diagnostic information
    return NextResponse.json({
      environment: envInfo,
      completionTest,
      assistantTest,
    });
  } catch (error: any) {
    console.error('Error in test-openai API:', error);
    return NextResponse.json(
      { error: `Error testing OpenAI API: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}