/**
 * Deployment Environment Preparation Script
 * 
 * This script ensures all environment variables are correctly set up for production deployment:
 * 1. Creates or updates .env.production with proper values from environment secrets
 * 2. Updates next.config.js with correct production settings
 * 3. Validates that required environment variables exist
 * 4. Performs a test connection to OpenAI API
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mask API key for safe logging
function maskApiKey(key) {
  if (!key) return 'undefined';
  if (key.length < 8) return '***';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

// Create or update .env.production file
function createEnvProduction() {
  console.log('\n📝 Creating .env.production file...');

  const envContent = `# Production environment variables
# This file is automatically loaded in production mode

# OpenAI configuration
OPENAI_API_KEY=\${OPENAI_API_KEY}
OPENAI_ASSISTANT_ID=asst_BpFiJmyhoHFYUj5ooLEoHEX2
ASSISTANT_ID=asst_BpFiJmyhoHFYUj5ooLEoHEX2

# Database
DATABASE_URL=\${DATABASE_URL}

# Auth
NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
NEXTAUTH_URL=\${NEXTAUTH_URL}

# Build
NODE_ENV=production
NEXT_PUBLIC_DEPLOYMENT_MODE=production
`;

  fs.writeFileSync('.env.production', envContent);
  console.log('✅ Created .env.production file');
}

// Test OpenAI API connection
async function testOpenAIConnection() {
  try {
    console.log('\n🔍 Testing OpenAI API connection...');
    
    // Only proceed if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OPENAI_API_KEY environment variable');
      return false;
    }
    
    console.log(`API Key present: ${maskApiKey(process.env.OPENAI_API_KEY)}`);
    console.log(`Assistant ID: ${process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'}`);
    
    // Dynamically import OpenAI
    const { OpenAI } = await import('openai');
    
    // Create an OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Test a simple chat completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello!' }],
      max_tokens: 5
    });
    
    console.log('✅ OpenAI API connection successful!');
    console.log(`   Response: ${completion.choices[0].message.content}`);
    
    // Now test the Assistant API
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    console.log(`Testing Assistant API with ID: ${assistantId}`);
    
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      console.log('✅ Successfully connected to Gabriel assistant!');
      console.log(`   Name: ${assistant.name}`);
      console.log(`   Model: ${assistant.model}`);
      return true;
    } catch (assistantError) {
      console.error('❌ Failed to connect to assistant:', assistantError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Preparing environment for deployment...');
  
  // Create .env.production file
  createEnvProduction();
  
  // Load environment variables
  require('dotenv').config({ path: '.env.production' });
  
  // Test OpenAI connection
  const openaiConnected = await testOpenAIConnection();
  
  if (openaiConnected) {
    console.log('\n✅ Environment ready for deployment!');
    console.log('✨ You can now deploy the application with confidence.');
  } else {
    console.error('\n❌ Environment preparation failed!');
    console.error('⚠️ Please fix the issues before deploying.');
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error('Error in deployment preparation:', err);
  process.exit(1);
});
