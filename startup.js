/**
 * Startup configuration for production deployments
 * This script ensures that all necessary environment variables are properly set before starting the application
 * It includes enhanced validation, error handling, and logging to diagnose production issues.
 */

// This is critical - load dotenv configuration explicitly so all variables are properly set
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.local' }); // Fallback to local env if needed
require('dotenv').config(); // Fallback to .env

const fs = require('fs');
const { execSync } = require('child_process');

// Ensure critical application variables are set with fallbacks
function setupEnvironmentVariables() {
  console.log('\n🔧 Setting up environment variables...');
  // Gabriel assistant ID - absolutely critical for the application
  process.env.OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
  process.env.ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;
  
  // These are important for the deployment environment
  process.env.NODE_ENV = 'production';
  process.env.NEXT_PUBLIC_DEPLOYMENT_MODE = 'production';

  // If we're missing critical variables, log an explicit error to help with debugging
  const criticalVars = ['OPENAI_API_KEY', 'DATABASE_URL'];
  const missing = criticalVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`\n⚠️ WARNING: Missing critical environment variables: ${missing.join(', ')}`);
    console.log('Proceeding anyway but the application may not function correctly.');
  } else {
    console.log('✅ All critical environment variables are set.');
  }
}

// Log masked environment info to avoid exposing secrets
function logEnvironmentInfo() {
  console.log('\n🚀 Starting LittleGabriel in production mode');
  console.log('Environment configuration:');
  console.log('- OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID);
  console.log('- ASSISTANT_ID:', process.env.ASSISTANT_ID || 'Not set (using primary assistant)');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  
  // Show the first 4 chars of the API key to verify it's loaded correctly
  const apiKey = process.env.OPENAI_API_KEY || '';
  const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.length}` : 'NOT SET';
  console.log('- OPENAI_API_KEY:', maskedKey);
  
  console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set');
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '********' : 'Not set');
}

// Write environment variables to a file that can be examined for debugging
function writeDebugFile() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    openai_assistant_id: process.env.OPENAI_ASSISTANT_ID,
    assistant_id: process.env.ASSISTANT_ID,
    nextauth_url: process.env.NEXTAUTH_URL,
    api_key_length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
    api_key_prefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 4) : 'none',
    database_url_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
  };
  
  fs.writeFileSync('debug-environment.json', JSON.stringify(debugInfo, null, 2));
  console.log('✅ Debug environment info saved to debug-environment.json');
}

// Run a quick OpenAI test to verify connectivity
async function testOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Cannot test OpenAI: API key is not set');
    return;
  }
  
  try {
    console.log('\n🔍 Testing OpenAI API connection...');
    
    // First try to use the production client which is more robust
    try {
      const productionClient = require('./src/lib/openai-production-client');
      console.log('✅ Using production-optimized OpenAI client');
      
      // Test API connectivity
      const connectionResult = await productionClient.testOpenAIConnection();
      if (connectionResult) {
        console.log('✅ OpenAI API connection is working properly');
      } else {
        console.error('❌ OpenAI API connection test failed');
      }
      
      // Test assistant access
      const assistantResult = await productionClient.testAssistantAccess();
      if (assistantResult) {
        console.log('✅ OpenAI Assistant access is working properly');
      } else {
        console.error('❌ OpenAI Assistant access test failed');
      }
      
      return;
    } catch (productionClientError) {
      console.log('⚠️ Production client not available, falling back to standard test');
    }
    
    // Fallback to standard test if production client isn't available
    // Dynamically import OpenAI to avoid issues if the module isn't available
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Simple test of completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello!' }],
      max_tokens: 10
    });
    
    console.log('✅ OpenAI API responded successfully!');
    console.log(`Response: ${response.choices[0].message.content}`);
    
    // Try to test assistant access
    if (process.env.OPENAI_ASSISTANT_ID) {
      try {
        console.log(`🤖 Testing access to assistant: ${process.env.OPENAI_ASSISTANT_ID}`);
        const assistant = await openai.beta.assistants.retrieve(
          process.env.OPENAI_ASSISTANT_ID
        );
        console.log(`✅ Assistant access successful! Name: ${assistant.name}`);
      } catch (assistantError) {
        console.error(`❌ Assistant access failed: ${assistantError.message}`);
      }
    }
  } catch (error) {
    console.error('❌ OpenAI API test failed:', error.message);
  }
}

// Main startup function - set up environment and start the app
async function startApp() {
  try {
    // Setup environment variables
    setupEnvironmentVariables();
    
    // Log environment information
    logEnvironmentInfo();
    
    // Write debug file for troubleshooting
    writeDebugFile();
    
    // Test OpenAI connection
    await testOpenAI();
    
    // Start the application using next start (production mode)
    console.log('\n🚀 Starting Next.js application in production mode...');
    const { spawn } = require('child_process');
    const nextStart = spawn('npx', ['next', 'start', '-p', '5000'], { stdio: 'inherit' });
    
    nextStart.on('close', (code) => {
      console.log(`\n👋 Next.js process exited with code ${code}`);
      process.exit(code);
    });
  } catch (error) {
    console.error('\n❌ Error during startup:', error);
    // Continue startup even if there's an error in our diagnostic functions
    console.log('\n🔄 Attempting to start Next.js despite errors...');
    const { spawn } = require('child_process');
    const nextStart = spawn('npx', ['next', 'start', '-p', '5000'], { stdio: 'inherit' });
    
    nextStart.on('close', (code) => {
      console.log(`Next.js process exited with code ${code}`);
      process.exit(code);
    });
  }
}

// Start the application
startApp().catch(err => {
  console.error('Unhandled error during startup:', err);
  // Ensure the app starts even if our wrapper fails
  console.log('\n🔄 Starting Next.js despite startup script error...');
  const { spawn } = require('child_process');
  const nextStart = spawn('npx', ['next', 'start', '-p', '5000'], { stdio: 'inherit' });
});
