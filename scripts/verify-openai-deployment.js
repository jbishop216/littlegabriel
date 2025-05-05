/**
 * Verify OpenAI Integration for Deployment
 * 
 * This script checks OpenAI integration in both development and production mode
 * to diagnose environment variable issues that occur only in production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Mask API key for safe output
function maskApiKey(key) {
  if (!key) return 'undefined';
  if (key.length < 8) return '***';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

// Test OpenAI access in the current environment
async function testOpenAIAccess() {
  try {
    // Use the OpenAI API that the app uses
    const { OpenAI } = await import('openai');
    
    // Try to initialize with current env vars
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\nEnvironment status:');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('- OPENAI_API_KEY:', maskApiKey(process.env.OPENAI_API_KEY));
    console.log('- OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID || 'not set');
    
    // Simple request to test connectivity
    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 5
    });
    
    console.log('\n✅ OpenAI API connection successful!');
    console.log('Response:', result.choices[0]?.message?.content);
    
    // If we have an assistant ID, try to retrieve it
    if (process.env.OPENAI_ASSISTANT_ID) {
      try {
        const assistant = await openai.beta.assistants.retrieve(
          process.env.OPENAI_ASSISTANT_ID
        );
        console.log('\n✅ Assistant retrieved successfully!');
        console.log('- Name:', assistant.name);
        console.log('- Model:', assistant.model);
      } catch (assistantError) {
        console.log('\n❌ Assistant retrieval failed!');
        console.log('Error:', assistantError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.log('\n❌ OpenAI API connection failed!');
    console.log('Error:', error.message);
    return false;
  }
}

// Check .env.production file
function checkProductionEnv() {
  console.log('\nChecking production environment file:');
  try {
    const envPath = path.join(process.cwd(), '.env.production');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      // Check for OpenAI API key
      const openAIKeyLine = lines.find(line => line.startsWith('OPENAI_API_KEY='));
      console.log('- OPENAI_API_KEY in .env.production:', openAIKeyLine ? 'Found' : 'Not found');
      
      if (openAIKeyLine) {
        const key = openAIKeyLine.split('=')[1]?.trim();
        if (key) {
          console.log('  Key value:', maskApiKey(key));
        }
      }
      
      // Check for Assistant ID
      const assistantIdLine = lines.find(line => line.startsWith('OPENAI_ASSISTANT_ID='));
      console.log('- OPENAI_ASSISTANT_ID in .env.production:', assistantIdLine ? 'Found' : 'Not found');
      
      if (assistantIdLine) {
        const id = assistantIdLine.split('=')[1]?.trim();
        if (id) {
          console.log('  ID value:', id);
        }
      }
    } else {
      console.log('- .env.production file not found!');
    }
  } catch (error) {
    console.log('- Error reading .env.production:', error.message);
  }
}

// Check configurations that might affect deployed OpenAI functionality
function checkConfigurations() {
  console.log('\nChecking configurations:');
  
  // Check next.config.js
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');
      console.log('- next.config.js: Found');
      
      // Check for env section
      const hasEnvConfig = content.includes('env:');
      console.log('  Contains env configuration:', hasEnvConfig ? 'Yes' : 'No');
      
      // Check for serverRuntimeConfig
      const hasServerConfig = content.includes('serverRuntimeConfig');
      console.log('  Contains serverRuntimeConfig:', hasServerConfig ? 'Yes' : 'No');
    } else {
      console.log('- next.config.js not found');
    }
  } catch (error) {
    console.log('- Error checking next.config.js:', error.message);
  }
}

// Main function
async function main() {
  console.log('🔍 OpenAI Integration Deployment Verification');
  console.log('=============================================');
  
  // Check OpenAI in development mode
  console.log('\n📋 TESTING IN DEVELOPMENT MODE:\n');
  process.env.NODE_ENV = 'development';
  await testOpenAIAccess();
  
  // Check OpenAI in production mode
  console.log('\n📋 TESTING IN PRODUCTION MODE:\n');
  process.env.NODE_ENV = 'production';
  await testOpenAIAccess();
  
  // Check .env.production
  checkProductionEnv();
  
  // Check configurations
  checkConfigurations();
  
  console.log('\n=============================================');
  console.log('🧪 Verification complete!\n');
}

// Run the main function
main().catch(error => {
  console.error('Error in verification script:', error);
  process.exit(1);
});
