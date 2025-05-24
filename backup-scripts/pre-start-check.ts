/**
 * Pre-Start Environment Check
 * 
 * This script runs before the application starts to ensure that all required
 * environment variables and configurations are properly set up.
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
loadEnvFiles();

function loadEnvFiles() {
  // Load environment variables from .env files in order of precedence
  const envFiles = ['.env', '.env.local', '.env.production'];
  
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file });
      console.log(`Loaded environment from ${file}`);
    }
  }
}

function checkEnvironmentVariables() {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  // Check for recommended variables
  const recommendedVars = ['OPENAI_ASSISTANT_ID', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);
  
  if (missingRecommended.length > 0) {
    console.warn(`\n⚠️ Missing recommended environment variables: ${missingRecommended.join(', ')}`);
    console.warn('The application may use fallbacks for these variables.');
  }
  
  console.log('✅ Environment variables check passed');
  return true;
}

async function testOpenAIConnection() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OpenAI API key not found');
    return false;
  }
  
  try {
    // Create OpenAI client
    const openai = new OpenAI({ apiKey });
    
    // Test basic API connectivity
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });
    
    console.log(`✅ OpenAI API connection successful: "${completion.choices[0].message.content}"`);
    return true;
  } catch (error: any) {
    console.error(`❌ OpenAI API connection failed: ${error.message}`);
    if (error.status) {
      console.error(`   Status code: ${error.status}`);
    }
    return false;
  }
}

async function main() {
  console.log('\nPre-Start Environment Check');
  console.log('=============================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check environment variables
  const envVarsOk = checkEnvironmentVariables();
  
  // Test OpenAI connection
  const openaiOk = await testOpenAIConnection();
  
  // Summarize results
  console.log('\nCheck Summary:');
  console.log(`Environment Variables: ${envVarsOk ? '✅ OK' : '❌ Issues Found'}`);
  console.log(`OpenAI API Connection: ${openaiOk ? '✅ OK' : '❌ Issues Found'}`);
  
  // Return success status
  if (!envVarsOk || !openaiOk) {
    console.error('\n❌ Pre-start check failed. Please fix the issues before continuing.');
    process.exit(1);
  }
  
  console.log('\n✅ All checks passed. Ready to start the application.');
}

// Run checks
main().catch(error => {
  console.error('Fatal error during pre-start check:', error);
  process.exit(1);
});
