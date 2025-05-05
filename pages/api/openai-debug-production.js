/**
 * Production-specific OpenAI Debug API
 * 
 * This endpoint provides comprehensive diagnostics for OpenAI integration
 * and is specifically optimized for the production environment.
 */

export default async function handler(req, res) {
  console.log('\n📊 Running OpenAI production debug endpoint');
  const timestamp = new Date().toISOString();
  
  try {
    // Test the production client module
    let productionClient;
    try {
      productionClient = require('../../src/lib/openai-production-client');
      console.log('✅ Production client module loaded successfully');
    } catch (moduleError) {
      console.error('❌ Failed to load production client module:', moduleError.message);
      return res.status(500).json({
        timestamp,
        error: 'Failed to load production client module',
        details: moduleError.message
      });
    }
    
    // Check environment variables
    const environment = {
      NODE_ENV: process.env.NODE_ENV || 'unknown',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
        `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'not set',
      OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length,
      OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || 'not set'
    };
    
    // Run the production client tests
    const tests = {};
    
    // Test 1: Create client
    let client;
    try {
      client = productionClient.createOpenAIClient();
      tests.client_creation = { status: 'success', message: 'Client created successfully' };
    } catch (clientError) {
      tests.client_creation = { 
        status: 'error', 
        message: `Failed to create client: ${clientError.message}`,
        error: clientError.message
      };
      
      return res.status(200).json({
        timestamp,
        environment,
        tests,
        error: 'Failed to create OpenAI client',
        recommendations: ['Verify that your OPENAI_API_KEY is correctly set']
      });
    }
    
    // Test 2: API connectivity
    try {
      const connectionResult = await productionClient.testOpenAIConnection();
      tests.api_connectivity = { 
        status: connectionResult ? 'success' : 'error',
        message: connectionResult ? 'API connectivity test passed' : 'API connectivity test failed'
      };
      
      if (!connectionResult) {
        return res.status(200).json({
          timestamp,
          environment,
          tests,
          error: 'OpenAI API connectivity test failed',
          recommendations: ['Check your API key and network connectivity']
        });
      }
    } catch (connectError) {
      tests.api_connectivity = { 
        status: 'error', 
        message: `API connectivity test error: ${connectError.message}`,
        error: connectError.message
      };
      
      return res.status(200).json({
        timestamp,
        environment,
        tests,
        error: 'Error during API connectivity test',
        recommendations: ['Check your API key and network connectivity']
      });
    }
    
    // Test 3: Assistant access
    try {
      const assistantResult = await productionClient.testAssistantAccess();
      tests.assistant_access = { 
        status: assistantResult ? 'success' : 'error',
        message: assistantResult ? 'Assistant access test passed' : 'Assistant access test failed'
      };
    } catch (assistantError) {
      tests.assistant_access = { 
        status: 'error', 
        message: `Assistant access test error: ${assistantError.message}`,
        error: assistantError.message
      };
    }
    
    // Calculate summary and recommendations
    const allTestsPassed = Object.values(tests).every(test => test.status === 'success');
    const summary = allTestsPassed
      ? 'All OpenAI production tests passed successfully!'
      : 'Some OpenAI production tests failed. Check recommendations for solutions.';
    
    const recommendations = !allTestsPassed 
      ? ['Verify that your OPENAI_API_KEY and OPENAI_ASSISTANT_ID are correctly set']
      : [];
    
    return res.status(200).json({
      timestamp,
      environment,
      tests,
      recommendations,
      summary
    });
    
  } catch (error) {
    console.error('Unhandled error in OpenAI production debug endpoint:', error);
    return res.status(500).json({
      timestamp,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
