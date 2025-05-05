/**
 * Simple OpenAI Production Fix
 * 
 * This script applies targeted fixes to ensure OpenAI integration 
 * works reliably in production environments.
 */

const fs = require('fs');
const path = require('path');

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Write file with necessary directories
function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content);
  console.log(`Created/Updated: ${filePath}`);
}

// Create a production-optimized OpenAI client
function createOpenAIClient() {
  console.log('\nCreating production-optimized OpenAI client...');
  
  const filePath = path.join('src', 'lib', 'openai-production-client.js');
  const content = `/**
 * Production-optimized OpenAI client
 */

const OpenAI = require('openai');

// Singleton instance
let client = null;

// Create OpenAI client with optimal settings
function createOpenAIClient() {
  if (client) return client;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Missing OpenAI API key');
    throw new Error('OpenAI API key not found');
  }
  
  try {
    console.log('Creating OpenAI client with API key:', apiKey.substring(0, 4) + '...');
    client = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 60000
    });
    return client;
  } catch (error) {
    console.error('Failed to create OpenAI client:', error.message);
    throw error;
  }
}

// Get assistant ID from environment
function getAssistantId() {
  return (
    process.env.OPENAI_ASSISTANT_ID ||
    process.env.ASSISTANT_ID ||
    'asst_BpFiJmyhoHFYUj5ooLEoHEX2'
  );
}

// Test OpenAI API connectivity
async function testOpenAIConnection() {
  try {
    const client = createOpenAIClient();
    
    console.log('Testing OpenAI API connection...');
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello! This is a test.' }],
      max_tokens: 20,
    });
    
    console.log('OpenAI connection successful:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('OpenAI test failed:', error.message);
    return false;
  }
}

// Test assistant access
async function testAssistantAccess() {
  try {
    const client = createOpenAIClient();
    const assistantId = getAssistantId();
    
    console.log('Testing assistant access:', assistantId);
    const assistant = await client.beta.assistants.retrieve(assistantId);
    
    console.log('Assistant access successful:', assistant.name);
    return true;
  } catch (error) {
    console.error('Assistant access failed:', error.message);
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

// Create a health check endpoint
function createHealthCheck() {
  console.log('\nCreating health check endpoint...');
  
  const filePath = path.join('pages', 'api', 'health.js');
  const content = `/**
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
`;

  writeFile(filePath, content);
}

// Set environment variables for production
function fixEnvironment() {
  console.log('\nSetting up environment variables...');
  
  const envPath = '.env.production';
  const envContent = [
    '# Production environment variables',
    'NODE_ENV=production',
    'NEXT_PUBLIC_DEPLOYMENT_MODE=production',
    '',
    `OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}`,
    `OPENAI_ASSISTANT_ID=${process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'}`,
    `ASSISTANT_ID=${process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'}`,
  ].join('\n');
  
  writeFile(envPath, envContent);
}

// Main function
function fixOpenAIProduction() {
  console.log('\nAPPLYING OPENAI PRODUCTION FIXES\n');
  
  // Create production client
  createOpenAIClient();
  
  // Create health check endpoint
  createHealthCheck();
  
  // Fix environment variables
  fixEnvironment();
  
  console.log('\nAll fixes applied successfully!\n');
  console.log('To test the fixes:');
  console.log('1. Use the health check endpoint: /api/health');
  console.log('2. Monitor logs for OpenAI API interactions');
}

// Run the fixer
fixOpenAIProduction();
