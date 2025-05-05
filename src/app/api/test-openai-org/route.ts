import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function GET(req: NextRequest) {
  try {
    // Get API key and organization ID from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const orgId = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION_ID;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not found in environment' }, { status: 500 });
    }
    
    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      apiKeyFirstChars: apiKey.substring(0, 4),
      apiKeyLastChars: apiKey.substring(apiKey.length - 4),
      apiKeyLength: apiKey.length,
      organizationId: orgId || 'Not set',
      deploymentMode: process.env.NEXT_PUBLIC_DEPLOYMENT_MODE || 'unknown',
      serverTime: new Date().toISOString(),
    };

    // Options for OpenAI client
    const options: any = { apiKey };
    
    // If organization ID is provided, include it in the options
    if (orgId) {
      options.organization = orgId;
      console.log(`TEST OPENAI ORG: Using organization ID: ${orgId}`);
    } else {
      console.log('TEST OPENAI ORG: No organization ID provided');
    }

    // Create OpenAI client
    console.log('TEST OPENAI ORG: Creating OpenAI client');
    const openai = new OpenAI(options);

    // Get models list as a lightweight API call to verify connectivity
    console.log('TEST OPENAI ORG: Retrieving models');
    const models = await openai.models.list();
    
    // Try to get organization info
    let organizationInfo = null;
    try {
      // Note: There's no direct API to get organization info in the Node.js client
      // So we'll just check if a basic API call works with the provided organization ID
      console.log('TEST OPENAI ORG: Verifying organization access');
      organizationInfo = {
        access_verified: true,
        models_available: models.data.length,
      };
    } catch (orgError: any) {
      console.error('TEST OPENAI ORG: Organization access verification failed:', orgError.message);
      organizationInfo = {
        access_verified: false,
        error: orgError.message
      };
    }
    
    // Get assistants list
    console.log('TEST OPENAI ORG: Retrieving assistants');
    const assistants = await openai.beta.assistants.list({
      limit: 20,
      order: 'desc',
    });
    
    // Extract basic assistant info without exposing sensitive data
    const assistantsList = assistants.data.map(assistant => ({
      id: assistant.id,
      name: assistant.name,
      model: assistant.model,
      created_at: assistant.created_at,
    }));

    // Try to directly access the target assistant
    console.log('TEST OPENAI ORG: Attempting to retrieve target assistant directly');
    let targetAssistant = null;
    let targetAssistantAccessible = false;
    try {
      targetAssistant = await openai.beta.assistants.retrieve('asst_BpFiJmyhoHFYUj5ooLEoHEX2');
      targetAssistantAccessible = true;
      console.log('TEST OPENAI ORG: Successfully retrieved target assistant');
    } catch (assistantError: any) {
      console.error('TEST OPENAI ORG: Error retrieving target assistant:', assistantError.message);
    }

    return NextResponse.json({
      success: true,
      environment: envInfo,
      organization: organizationInfo,
      models_available: models.data.length,
      models_sample: models.data.slice(0, 3).map(model => model.id),
      assistants_found: assistants.data.length,
      assistants: assistantsList,
      target_assistant_id: 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
      target_assistant_found: assistants.data.some(a => a.id === 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'),
      target_assistant_direct_access: targetAssistantAccessible,
      target_assistant_details: targetAssistant ? {
        id: targetAssistant.id,
        name: targetAssistant.name,
        model: targetAssistant.model,
        created_at: targetAssistant.created_at,
      } : null,
    });
  } catch (error: any) {
    console.error('TEST OPENAI ORG: Error:', error);
    
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
        organizationId: process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION_ID || 'Not set',
        serverTime: new Date().toISOString(),
      }
    }, { status: 500 });
  }
}