import OpenAI from 'openai';
import { ENV, logEnvironment } from './env';
import { logOpenAIError } from './openai-error-handler';

// Singleton instance of OpenAI client - prevents creating multiple clients
// and ensures consistent API access throughout the application
let _openaiInstance: OpenAI | null = null;

/**
 * Creates an OpenAI client with additional error handling and resilience for production deployments
 * 
 * This function is critical for the application and includes multiple fallback mechanisms to ensure
 * we can connect to OpenAI even in challenging deployment environments where env vars might not be 
 * properly set.
 * 
 * This implementation uses a singleton pattern to ensure we only create one client instance
 * and directly accesses process.env for maximum reliability in dynamic environments.
 */
export function createClient() {
  // If we already have an instance, return it (singleton pattern)
  if (_openaiInstance) {
    return _openaiInstance;
  }

  // Always log environment in all environments to help with debugging
  // We modify the logEnvironment function to be safe in production
  try {
    // Get API key directly from process.env first (most reliable source)
    // Fall back to ENV object if needed
    const apiKey = process.env.OPENAI_API_KEY || ENV.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('ERROR: Missing OpenAI API key. Please set OPENAI_API_KEY in your environment variables.');
      throw new Error('Missing OpenAI API key. Please set OPENAI_API_KEY in your environment variables.');
    }
    
    // Add more logging to help debug production issues (masked for security)
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    
    console.log('🔑 Creating OpenAI client with API key info:', { 
      keyPresent: !!apiKey, 
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 4) // Log just the first few characters for verification
    });
    
    // Get assistant ID directly from environment variables with fallbacks
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 
                        process.env.ASSISTANT_ID || 
                        ENV.OPENAI_ASSISTANT_ID || 
                        'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    
    console.log('🤖 Using Assistant ID:', assistantId);
    
    // Check if we're running in production environment
    const isProduction = process.env.NODE_ENV === 'production' || ENV.IS_PRODUCTION;
    
    console.log('🌎 Environment:', {
      NODE_ENV: process.env.NODE_ENV || ENV.NODE_ENV,
      isProduction
    });
    
    // Create and return the OpenAI client with additional configuration for reliability
    _openaiInstance = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: false, // Ensure API key is not exposed in browser
      maxRetries: 5, // Increased retries for network resilience
      timeout: 120000, // Increased timeout for slower connections (120 seconds)
    });
    
    return _openaiInstance;
  } catch (error) {
    // Use our new enhanced error handler for better diagnostics
    logOpenAIError(error, 'createClient()');
    
    // In production, recommend checking the debug endpoint
    if (process.env.NODE_ENV === 'production') {
      console.error('\n🔍 For complete diagnostics, visit: /api/openai-debug-production');
    }
    
    // Add debug comment with URL to check
    console.error('\n➡️ If this error persists after deployment, please access /api/openai-debug-production');
    throw error;
  }
}

/**
 * Get the assistant ID to use for chat conversations.
 * This centralizes the assistant ID logic and ensures consistent usage
 * across the application.
 */
export function getAssistantId() {
  return process.env.OPENAI_ASSISTANT_ID || 
         process.env.ASSISTANT_ID || 
         ENV.OPENAI_ASSISTANT_ID || 
         'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
}
