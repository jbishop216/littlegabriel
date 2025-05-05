/**
 * Simple OpenAI Connectivity Check API
 * This is a lightweight, direct check of the OpenAI API, bypassing complex logic
 */
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ENV } from '@/lib/env';

type TestResult = {
  success: boolean;
  message: string;
  assistant?: {
    name: string | null;
    model: string;
  };
  completion?: string | null;
  error?: string;
};

type ApiResponse = {
  environment: {
    nodeEnv: string;
    apiKeyPresent: boolean;
    apiKeyLength: number;
    assistantId: string;
  };
  testResult: TestResult | null;
  timestamp: string;
  error?: string;
};

export async function GET() {
  try {
    // Get environment info from our centralized ENV object
    const apiKey = ENV.OPENAI_API_KEY;
    const assistantId = ENV.OPENAI_ASSISTANT_ID;
    
    // Create a response object with environment info
    const result: ApiResponse = {
      environment: {
        nodeEnv: ENV.NODE_ENV,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        assistantId
      },
      testResult: null,
      timestamp: new Date().toISOString()
    };
    
    // Only proceed if we have an API key
    if (!apiKey) {
      return NextResponse.json({
        ...result,
        error: 'OpenAI API key is not set'
      }, { status: 503 });
    }
    
    // Create an OpenAI client directly (not using our helper)
    const openai = new OpenAI({
      apiKey: apiKey
    });
    
    // Make a very simple API call to test connectivity
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      });
      
      // Try to retrieve the assistant
      try {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        result.testResult = {
          success: true,
          message: 'API connection successful and assistant found',
          assistant: {
            name: assistant.name,
            model: assistant.model
          },
          completion: completion.choices[0].message.content
        };
      } catch (error: any) {
        result.testResult = {
          success: false,
          message: 'API connection successful but assistant not found',
          error: error.message || 'Unknown assistant error',
          completion: completion.choices[0].message.content
        };
      }
    } catch (error: any) {
      result.testResult = {
        success: false,
        message: 'API connection failed',
        error: error.message || 'Unknown API error'
      };
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
