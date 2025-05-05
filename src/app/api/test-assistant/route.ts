import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Get API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

// Assistant ID to test
const assistantId = 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

export async function GET(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API key not found in environment' }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    // Record environment information
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV,
      apiKeyFirstChars: apiKey.substring(0, 4),
      apiKeyLength: apiKey.length,
      assistantId,
      deploymentMode: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'unknown',
      serverTime: new Date().toISOString(),
    };
    
    // Attempt to retrieve the assistant
    console.log('TEST ASSISTANT API: Attempting to retrieve assistant:', assistantId);
    console.log('Environment:', environmentInfo);
    
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    // Return success with assistant details and environment info
    return NextResponse.json({
      success: true,
      assistant: {
        name: assistant.name,
        model: assistant.model,
        id: assistant.id,
        created_at: assistant.created_at,
      },
      environment: environmentInfo
    });
    
  } catch (error: any) {
    // Log detailed error information
    console.error('TEST ASSISTANT API: Error accessing assistant:', error);
    
    // Return error response with detailed information
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Unknown error',
        status: error.status || 500,
        type: error.type || 'unknown_error',
        details: error.response?.data || 'No additional details',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiKeyFirstChars: apiKey ? apiKey.substring(0, 4) : 'none',
        apiKeyLength: apiKey ? apiKey.length : 0,
        assistantId,
        deploymentMode: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'unknown',
        serverTime: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}