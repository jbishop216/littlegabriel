/**
 * OpenAI Error Handler
 * 
 * This utility provides detailed error handling and diagnostics for OpenAI API errors.
 * It can be used both in the API routes and client-side error handling to provide
 * clear error messages and diagnostic information.
 */

import { getEnvVar } from './env';

// Define types for error handling
export type OpenAIErrorInfo = {
  message: string;          // User-friendly error message
  title: string;            // Short error title 
  code: string;             // Error code for programmatic handling
  suggestion: string;       // Suggested action to fix the issue
  debugInfo?: any;          // Additional debug information (not shown to users)
  retry?: boolean;          // Whether the operation can be retried
  fatal?: boolean;          // Whether this is a fatal error that needs admin attention
};

/**
 * Process an OpenAI API error and return structured error information
 */
export function handleOpenAIError(error: any): OpenAIErrorInfo {
  console.error('OpenAI API Error:', error);

  // Default error info
  const defaultErrorInfo: OpenAIErrorInfo = {
    message: 'An unexpected error occurred while communicating with Gabriel.',
    title: 'AI Service Error',
    code: 'unknown_error',
    suggestion: 'Please try again later.',
    retry: true,
    fatal: false,
    debugInfo: { originalError: error?.message }
  };

  // Not an error object at all
  if (!error) {
    return {
      ...defaultErrorInfo,
      code: 'null_error',
      message: 'No error information available.',
      debugInfo: { error: 'null or undefined error object' }
    };
  }

  // Get error message, handling different error formats
  const errorMessage = error.message || error.error?.message || JSON.stringify(error);
  
  // Add base debug info
  const debugInfo = {
    originalError: errorMessage,
    stack: error.stack,
    type: error.constructor?.name,
    statusCode: error.status || error.statusCode,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      apiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 4) : 'none',
      assistantId: process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || 'not set'
    }
  };

  // Authentication errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('invalid api key') ||
    errorMessage.includes('Incorrect API key') ||
    errorMessage.includes('credential') ||
    error.status === 401
  ) {
    return {
      message: 'Gabriel cannot connect due to authentication issues.',
      title: 'Authentication Error',
      code: 'auth_error',
      suggestion: 'Please contact the administrator to check the OpenAI API key configuration.',
      retry: false,
      fatal: true,
      debugInfo: {
        ...debugInfo,
        errorType: 'authentication'
      }
    };
  }

  // Rate limiting errors
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests') ||
    error.status === 429
  ) {
    return {
      message: 'Gabriel is experiencing high demand right now.',
      title: 'Rate Limit Reached',
      code: 'rate_limit',
      suggestion: 'Please try again in a few minutes.',
      retry: true,
      fatal: false,
      debugInfo: {
        ...debugInfo,
        errorType: 'rate_limit'
      }
    };
  }

  // Assistant-specific errors
  if (errorMessage.includes('assistant')) {
    // Assistant ID issues
    if (errorMessage.includes('No such assistant')) {
      return {
        message: 'Gabriel assistant could not be found.',
        title: 'Assistant Not Found',
        code: 'assistant_not_found',
        suggestion: 'Please contact the administrator to check the assistant configuration.',
        retry: false,
        fatal: true,
        debugInfo: {
          ...debugInfo,
          errorType: 'assistant_not_found',
          assistantId: getEnvVar('OPENAI_ASSISTANT_ID', 'Not Set')
        }
      };
    }

    // Generic assistant error
    return {
      message: 'Gabriel assistant is currently unavailable.',
      title: 'Assistant Error',
      code: 'assistant_error',
      suggestion: 'Please try again later or contact support if the problem persists.',
      retry: true,
      fatal: false,
      debugInfo: {
        ...debugInfo,
        errorType: 'assistant_general'
      }
    };
  }

  // Network-related errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('ETIMEDOUT') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND')
  ) {
    return {
      message: 'Gabriel is having trouble connecting to the AI service.',
      title: 'Network Error',
      code: 'network_error',
      suggestion: 'Please check your internet connection and try again.',
      retry: true,
      fatal: false,
      debugInfo: {
        ...debugInfo,
        errorType: 'network'
      }
    };
  }

  // Server errors
  if (error.status >= 500 || errorMessage.includes('server')) {
    return {
      message: 'The AI service is currently experiencing issues.',
      title: 'Server Error',
      code: 'server_error',
      suggestion: 'Please try again later.',
      retry: true,
      fatal: false,
      debugInfo: {
        ...debugInfo,
        errorType: 'server'
      }
    };
  }

  // If we get here, it's an unhandled error type
  return {
    ...defaultErrorInfo,
    debugInfo: {
      ...debugInfo,
      errorType: 'unhandled'
    }
  };
}

/**
 * Log detailed information about the error to the console
 * Useful for debugging but keeping logs clean
 */
export function logOpenAIError(error: any, context?: string): void {
  const errorInfo = handleOpenAIError(error);
  
  console.error(`\n❌ OpenAI ERROR${context ? ` (${context})` : ''}:`);
  console.error(`Title: ${errorInfo.title}`);
  console.error(`Message: ${errorInfo.message}`);
  console.error(`Code: ${errorInfo.code}`);
  console.error(`Suggestion: ${errorInfo.suggestion}`);
  console.error('Debug Info:', errorInfo.debugInfo);
  
  // Log additional context about the environment
  console.error('\nEnvironment context:');
  console.error(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.error(`- OPENAI_API_KEY present: ${!!process.env.OPENAI_API_KEY}`);
  console.error(`- OPENAI_ASSISTANT_ID: ${process.env.OPENAI_ASSISTANT_ID || 'not set'}`);
  console.error(`- ASSISTANT_ID: ${process.env.ASSISTANT_ID || 'not set'}`);
  
  // Provide a link to the debug endpoint in production
  if (process.env.NODE_ENV === 'production') {
    console.error('\nFor complete diagnostics, visit the debug endpoint: /api/openai-debug-production');
  }
}
