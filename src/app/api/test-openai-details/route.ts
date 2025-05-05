import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function GET(req: NextRequest) {
  try {
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not found in environment' }, { status: 500 });
    }
    
    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      apiKeyFirstChars: apiKey.substring(0, 4),
      apiKeyLastChars: apiKey.substring(apiKey.length - 4),
      apiKeyLength: apiKey.length,
      deploymentMode: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'unknown',
      serverTime: new Date().toISOString(),
    };

    // Create OpenAI client
    console.log('TEST OPENAI DETAILS: Creating OpenAI client');
    const openai = new OpenAI({ apiKey });

    // Get organization details
    console.log('TEST OPENAI DETAILS: Retrieving models');
    
    // Get models list as a lightweight API call to verify connectivity
    const models = await openai.models.list();
    
    // Get assistants list
    console.log('TEST OPENAI DETAILS: Retrieving assistants');
    const assistants = await openai.beta.assistants.list({
      limit: 10,
      order: 'desc',
    });
    
    // Extract basic assistant info without exposing sensitive data
    const assistantsList = assistants.data.map(assistant => ({
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      created_at: assistant.created_at,
    }));

    return NextResponse.json({
      success: true,
      environment: envInfo,
      models_available: models.data.length,
      models_sample: models.data.slice(0, 3).map(model => model.id),
      assistants_found: assistants.data.length,
      assistants: assistantsList,
      target_assistant_id: 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
      target_assistant_found: assistants.data.some(a => a.id === 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'),
    });
  } catch (error: any) {
    console.error('TEST OPENAI DETAILS: Error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: error.message || 'Unknown error',
        status: error.status || 500,
        type: error.type || 'unknown_error',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        apiKeyExists: !!process.env.OPENAI_API_KEY,
        apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
        serverTime: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}