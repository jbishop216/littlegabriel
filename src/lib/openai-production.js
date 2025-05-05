/**
 * Production-optimized OpenAI client
 * 
 * This module provides a more resilient OpenAI client implementation specifically
 * designed for production environments where environment variables might be accessed
 * differently and error handling is critical.
 * 
 * Unlike the TypeScript version, this uses plain JavaScript for maximum compatibility
 * and will be used as a fallback in production if the typed version has issues.
 */

const OpenAI = require('openai');

// Singleton instance to avoid creating multiple clients
let client = null;

/**
 * Create an OpenAI client with production-optimized settings
 * Will use a singleton pattern to ensure consistent usage
 */
function createProductionClient() {
  // Return existing client if already created
  if (client) {
    return client;
  }
  
  try {
    // Directly access environment variables for maximum reliability
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('CRITICAL ERROR: Missing OpenAI API key. Please set OPENAI_API_KEY environment variable.');
      throw new Error('OpenAI API key not found in environment');
    }
    
    // Log masked key info for debugging (safe to log in production)
    console.log(`Creating OpenAI client with API key (${apiKey.substring(0, 4)}...)`);
    
    // Create OpenAI client with production-optimized settings
    client = new OpenAI({
      apiKey,
      maxRetries: 5,        // More retries for production resilience
      timeout: 120000,      // Longer timeout (120s) for production connections
      dangerouslyAllowBrowser: false
    });
    
    return client;
  } catch (error) {
    console.error('Failed to create OpenAI client:', error.message);
    throw error;
  }
}

/**
 * Get the OpenAI assistant ID from environment variables
 * Checks multiple possible environment variable names
 */
function getAssistantId() {
  // Check all possible environment variable names
  return (
    process.env.OPENAI_ASSISTANT_ID ||
    process.env.ASSISTANT_ID ||
    'asst_BpFiJmyhoHFYUj5ooLEoHEX2'
  );
}

/**
 * Run a basic test to check if the OpenAI API is working
 * This is useful for diagnostics and health checks
 */
async function testOpenAI() {
  try {
    const openai = createProductionClient();
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, this is a test.' }],
      max_tokens: 20,
    });
    
    return {
      status: 'success',
      message: 'OpenAI API is working correctly',
      response: completion.choices[0].message.content
    };
  } catch (error) {
    return {
      status: 'error',
      message: `OpenAI API test failed: ${error.message}`,
      error: error.message
    };
  }
}

module.exports = {
  createClient: createProductionClient,
  getAssistantId,
  testOpenAI
};
