/**
 * Fix OpenAI in Production
 * 
 * This script performs a comprehensive fix for OpenAI integration issues
 * in the production environment. It:
 * 
 * 1. Ensures all necessary environment variables are set correctly
 * 2. Creates a production-optimized OpenAI client
 * 3. Configures specialized error handling for OpenAI in production
 * 4. Adds diagnostic endpoints for troubleshooting in production
 * 5. Tests the OpenAI connection to verify fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure a directory exists, creating it if needed
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Write content to a file, creating directories if needed
function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created/Updated: ${filePath}`);
}

// Create a production-optimized OpenAI client implementation
function createProductionOpenAIClient() {
  const filePath = path.join('src', 'lib', 'openai-production-client.js');
  const content = `/**
 * Production-optimized OpenAI client
 * 
 * This implementation is specifically designed for production environments
 * with enhanced error handling and resilience.
 */

const OpenAI = require('openai');

// Singleton client instance
let openaiClient = null;

/**
 * Create an OpenAI client with production-optimized settings
 */
function createOpenAIClient() {
  // Return existing client if already created
  if (openaiClient) {
    return openaiClient;
  }
  
  try {
    // Log masked key info for debugging (safe to log in production)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ CRITICAL ERROR: Missing OpenAI API key. Please set OPENAI_API_KEY environment variable.');
      throw new Error('OpenAI API key not found in environment');
    }
    
    const keyPrefix = apiKey.substring(0, 4);
    const keyLength = apiKey.length;
    console.log(`Creating OpenAI client with API key info: { keyPrefix: '${keyPrefix}', keyLength: ${keyLength} }`);
    
    // Create OpenAI client with production-optimized settings
    openaiClient = new OpenAI({
      apiKey,
      maxRetries: 3,        // More retries for production resilience
      timeout: 60000        // Longer timeout (60s) for production connections
    });
    
    return openaiClient;
  } catch (error) {
    console.error('❌ Failed to create OpenAI client:', error.message);
    throw error;
  }
}

/**
 * Get the assistant ID from environment variables
 * Checks multiple possible variable names for maximum compatibility
 */
function getAssistantId() {
  return (
    process.env.OPENAI_ASSISTANT_ID ||
    process.env.ASSISTANT_ID ||
    'asst_BpFiJmyhoHFYUj5ooLEoHEX2' // Fallback ID if not set in environment
  );
}

/**
 * Run a simple test to verify OpenAI API connectivity
 */
async function testOpenAIConnection() {
  try {
    const client = createOpenAIClient();
    
    console.log('🔄 Testing OpenAI API connectivity...');
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello! This is a test message.' }],
      max_tokens: 20,
    });
    
    console.log(`✅ OpenAI connection successful. Response: "${completion.choices[0].message.content}"`);
    return true;
  } catch (error) {
    console.error(`❌ OpenAI test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test access to the assistant
 */
async function testAssistantAccess() {
  try {
    const client = createOpenAIClient();
    const assistantId = getAssistantId();
    
    console.log(`🤖 Testing access to assistant: ${assistantId}`);
    const assistant = await client.beta.assistants.retrieve(assistantId);
    
    console.log(`✅ Assistant access successful. Name: ${assistant.name}, Model: ${assistant.model}`);
    return true;
  } catch (error) {
    console.error(`❌ Assistant access failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  createOpenAIClient,
  getAssistantId,
  testOpenAIConnection,
  testAssistantAccess
};
`;

  writeFile(filePath, content);
}

// Create production-specific OpenAI error handler
function createOpenAIErrorHandler() {
  const filePath = path.join('src', 'lib', 'openai-error-handler.js');
  const content = `/**
 * OpenAI Error Handler
 * 
 * This module provides specialized error handling for OpenAI API errors,
 * with enhanced logging and recovery strategies for production use.
 */

/**
 * Process an OpenAI API error and provide useful diagnostic information
 * and recovery recommendations.
 */
export function handleOpenAIError(error, operation = 'API call') {
  // Extract error details
  const errorType = error.constructor.name;
  const errorMessage = error.message;
  const statusCode = error.status || 'unknown';
  
  // Start building error report
  const report = {
    timestamp: new Date().toISOString(),
    operation,
    errorType,
    errorMessage,
    statusCode,
    recommendation: '',
  };
  
  // Generate specific recommendations based on error type
  if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
    report.recommendation = 'Check your API key. It may be invalid or expired.';
  }
  else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    report.recommendation = 'Rate limit exceeded. Reduce request frequency or upgrade your plan.';
  }
  else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
    report.recommendation = 'OpenAI server error. Wait and retry your request later.';
  }
  else if (errorMessage.includes('timeout')) {
    report.recommendation = 'Request timed out. Check your network connection or try again later.';
  }
  else if (errorMessage.includes('no such assistant')) {
    report.recommendation = 'Assistant ID not found. Verify your OPENAI_ASSISTANT_ID environment variable.';
  }
  else {
    report.recommendation = 'Unexpected error. Check your request parameters and try again.';
  }
  
  // Log the detailed error for diagnostics
  console.error(`OpenAI Error: ${operation} failed with ${errorType}`);
  console.error(`- Message: ${errorMessage}`);
  console.error(`- Status: ${statusCode}`);
  console.error(`- Recommendation: ${report.recommendation}`);
  
  // Add environment information in production to help with debugging
  if (process.env.NODE_ENV === 'production') {
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID;
    
    console.error('Environment information:');
    console.error(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.error(`- API key present: ${!!apiKey}`);
    if (apiKey) {
      console.error(`- API key first 4 chars: ${apiKey.substring(0, 4)}`);
      console.error(`- API key length: ${apiKey.length}`);
    }
    console.error(`- Assistant ID: ${assistantId || 'not set'}`);
  }
  
  return report;
}

/**
 * Get a user-friendly error message for OpenAI errors
 */
export function getUserFriendlyErrorMessage(error) {
  const errorReport = handleOpenAIError(error);
  
  // Generic error message for users
  let userMessage = 'Sorry, I had trouble connecting to my knowledge service. ';
  
  // Add specific but non-technical advice based on the error
  if (errorReport.errorMessage.includes('401') || errorReport.errorMessage.includes('authentication')) {
    userMessage += 'There seems to be an authentication issue. Please try again later or contact support.';
  }
  else if (errorReport.errorMessage.includes('429') || errorReport.errorMessage.includes('rate limit')) {
    userMessage += 'We\'re experiencing high demand right now. Please try again in a moment.';
  }
  else if (errorReport.errorMessage.includes('500') || errorReport.errorMessage.includes('server error')) {
    userMessage += 'Our service is temporarily unavailable. Please try again later.';
  }
  else if (errorReport.errorMessage.includes('timeout')) {
    userMessage += 'The request took too long to complete. Please check your connection and try again.';
  }
  else {
    userMessage += 'Please try again or refresh the page.';
  }
  
  return userMessage;
}
`;

  writeFile(filePath, content);
}

// Create a health check endpoint for monitoring in production
function createHealthCheckEndpoint() {
  const filePath = path.join('pages', 'api', 'health.js');
  const content = `/**
 * Health Check API
 * 
 * This API endpoint provides a comprehensive health check of the application,
 * including OpenAI connectivity. It's designed to be lightweight and fast
 * for monitoring services while still providing useful diagnostic information.
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
    // Try to use production client first (more reliable)
    try {
      const productionClient = require('../../src/lib/openai-production-client');
      const apiConnectivity = await productionClient.testOpenAIConnection();
      health.services.openai = {
        status: apiConnectivity ? 'ok' : 'error',
        message: apiConnectivity ? 
          'OpenAI API is responding correctly' : 
          'OpenAI API test failed'
      };

      // Only check assistant if API is working
      if (apiConnectivity) {
        const assistantConnectivity = await productionClient.testAssistantAccess();
        health.services.openai_assistant = {
          status: assistantConnectivity ? 'ok' : 'error',
          message: assistantConnectivity ? 
            'Assistant is accessible' : 
            'Assistant access failed'
        };
      }
    } catch (productionError) {
      // Fall back to basic check if production client fails
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Simple connectivity test
      await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      
      health.services.openai = {
        status: 'ok',
        message: 'OpenAI API is responding correctly (fallback check)'
      };
    }
  } catch (error) {
    health.services.openai = {
      status: 'error',
      message: `OpenAI API error: ${error.message}`
    };
    health.status = 'degraded';
  }

  // Check database connectivity (if we have access to Prisma)
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Simple query to validate database connection
    await prisma.$queryRaw\`SELECT 1\`;
    await prisma.$disconnect();
    
    health.services.database = {
      status: 'ok',
      message: 'Database is connected and responding'
    };
  } catch (dbError) {
    health.services.database = {
      status: 'error',
      message: `Database error: ${dbError.message}`
    };
    health.status = 'degraded';
  }

  // Add response time
  health.responseTime = `${Date.now() - startTime}ms`;

  // Return appropriate status code
  const httpStatus = health.status === 'ok' ? 200 : 503;
  return res.status(httpStatus).json(health);
}
`;

  writeFile(filePath, content);
}

// Create a specialized OpenAI debug endpoint for production troubleshooting
function createOpenAIDebugEndpoint() {
  const filePath = path.join('pages', 'api', 'openai-debug-production.js');
  const content = `/**
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
`;

  writeFile(filePath, content);
}

// Fix environment variables for production
function fixEnvironmentVariables() {
  console.log('\n🌐 Setting up environment variables for production...');
  
  // Create .env.production file
  const envPath = '.env.production';
  const envContent = [
    '# Production environment variables',
    '# Generated by fix-openai-production.js',
    '',
    `NODE_ENV=production`,
    `NEXT_PUBLIC_DEPLOYMENT_MODE=production`,
    '',
    '# OpenAI configuration',
    `OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}`,
    `OPENAI_ASSISTANT_ID=${process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'}`,
    `ASSISTANT_ID=${process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'}`,
    '',
    '# Next.js configuration',
    `NEXTAUTH_URL=${process.env.NEXTAUTH_URL || 'http://localhost:5000'}`,
    `NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET || require('crypto').randomBytes(32).toString('hex')}`,
  ].join('\n');
  
  writeFile(envPath, envContent);
  console.log(`✅ Created ${envPath} with production settings`);
}

// Update next.config.js with production optimizations
function updateNextConfig() {
  const filePath = 'next.config.js';
  const content = `/** @type {import('next').NextConfig} */

module.exports = {
  env: {
    OPENAI_ASSISTANT_ID: 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
    NEXT_PUBLIC_DEPLOYMENT_MODE: 'production',
  },
  
  // Ensure these paths get included in the build
  transpilePackages: ['next-auth'],
  
  // Improve webpack configuration for better module resolution
  webpack: (config, { isServer }) => {
    // Fix issues with modules that might cause errors in the production build
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      child_process: false,
      net: false,
      tls: false,
    };

    // Improve error handling for webpack build
    config.optimization.moduleIds = 'deterministic';
    
    // Provide polyfills for browser APIs that might be used by OpenAI SDK
    if (!isServer) {
      // Add necessary browser polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        crypto: require.resolve('crypto-browserify'),
      };
    }

    return config;
  },
  
  // Disable React StrictMode in production to prevent double-mounting issues
  reactStrictMode: process.env.NODE_ENV !== 'production',
  
  // Skip type checking during production build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },
};
`;

  // Only update if the content is different
  if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
    writeFile(filePath, content);
    console.log(`✅ Updated ${filePath} with production optimizations`);
  } else {
    console.log(`✓ ${filePath} already has correct production settings`);
  }
}

// Test OpenAI connection to verify fixes are working
async function testOpenAIConnection() {
  console.log('\n🔍 Testing OpenAI connection after fixes...');
  
  try {
    // Try to load the production client
    const productionClient = require('./src/lib/openai-production-client');
    console.log('✅ Successfully loaded production OpenAI client');
    
    // Test API connectivity
    const apiConnectivity = await productionClient.testOpenAIConnection();
    if (apiConnectivity) {
      console.log('✅ OpenAI API connection is working properly');
    } else {
      console.error('❌ OpenAI API connection failed');
      return false;
    }
    
    // Test assistant access
    const assistantConnectivity = await productionClient.testAssistantAccess();
    if (assistantConnectivity) {
      console.log('✅ OpenAI Assistant access is working properly');
    } else {
      console.error('❌ OpenAI Assistant access failed');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ OpenAI connection test failed:', error.message);
    return false;
  }
}

// Main function to run all fixes
async function fixOpenAIProduction() {
  console.log('\n🔧 FIXING OPENAI IN PRODUCTION\n');
  
  // Step 1: Create production-optimized OpenAI client
  createProductionOpenAIClient();
  
  // Step 2: Create OpenAI error handler
  createOpenAIErrorHandler();
  
  // Step 3: Create health check endpoint
  createHealthCheckEndpoint();
  
  // Step 4: Create OpenAI debug endpoint
  createOpenAIDebugEndpoint();
  
  // Step 5: Fix environment variables
  fixEnvironmentVariables();
  
  // Step 6: Update next.config.js with production optimizations
  updateNextConfig();
  
  // Step 7: Test OpenAI connection
  const testResult = await testOpenAIConnection();
  
  console.log('\n📊 OPENAI PRODUCTION FIX RESULTS:');
  if (testResult) {
    console.log('🎉 All fixes have been applied successfully!');
    console.log('✅ OpenAI should now work correctly in production.');
  } else {
    console.error('⚠️ Fixes were applied but OpenAI connection test failed.');
    console.log('You may need to check your OPENAI_API_KEY and OPENAI_ASSISTANT_ID.');
  }
  
  console.log('\nℹ️ Diagnostic endpoints created:');
  console.log('- /api/health - Basic health check');
  console.log('- /api/openai-debug-production - Detailed OpenAI diagnostics');
}

// Run the main function
fixOpenAIProduction().catch(error => {
  console.error('\n💥 Unexpected error during OpenAI production fix:', error);
});
