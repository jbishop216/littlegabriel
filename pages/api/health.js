/**
 * Health Check API
 */

export default async function handler(req, res) {
  const startTime = Date.now();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {}
  };

  // Check OpenAI integration
  try {
    // Use production client
    const productionClient = require('../../src/lib/openai-production-client');
    const apiConnectivity = await productionClient.testOpenAIConnection();
    health.services.openai = {
      status: apiConnectivity ? 'ok' : 'error',
      message: apiConnectivity ? 'OpenAI API is responding' : 'OpenAI API test failed'
    };

    // Check assistant
    if (apiConnectivity) {
      const assistantConnectivity = await productionClient.testAssistantAccess();
      health.services.openai_assistant = {
        status: assistantConnectivity ? 'ok' : 'error',
        message: assistantConnectivity ? 'Assistant is accessible' : 'Assistant access failed'
      };
    }
  } catch (error) {
    health.services.openai = {
      status: 'error',
      message: 'OpenAI API error: ' + error.message
    };
    health.status = 'degraded';
  }

  // Add response time
  health.responseTime = Date.now() - startTime + 'ms';

  // Return appropriate status code
  const httpStatus = health.status === 'ok' ? 200 : 503;
  return res.status(httpStatus).json(health);
}
