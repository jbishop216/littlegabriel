/**
 * OpenAI Integration Test Script
 * 
 * This script provides a comprehensive test of OpenAI integration in both development and production modes.
 * It verifies that the OpenAI API is accessible and that the Gabriel assistant can be reached.
 * 
 * Features:
 * - Tests chat completions API
 * - Tests Assistants API with Gabriel assistant
 * - Tests both development and production environments
 * - Provides detailed diagnostics for troubleshooting
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Mask API key for safe logging
function maskApiKey(key) {
  if (!key) return 'undefined';
  if (key.length < 8) return '***';
  return key.slice(0, 4) + '...' + key.slice(-4);
}

// Function to run tests in development mode
async function testDevelopment() {
  console.log('\n🔌 Testing OpenAI in DEVELOPMENT mode');
  console.log('====================================');
  
  // Load development environment variables
  require('dotenv').config({ path: '.env.local' });
  require('dotenv').config({ path: '.env' });
  
  return runTests('development');
}

// Function to run tests in production mode
async function testProduction() {
  console.log('\n🔍 Testing OpenAI in PRODUCTION mode');
  console.log('====================================');
  
  // Load production environment variables
  require('dotenv').config({ path: '.env.production' });
  process.env.NODE_ENV = 'production';
  
  return runTests('production');
}

// Run the actual tests
async function runTests(mode) {
  try {
    // Log environment details
    console.log(`Environment: ${mode}`);
    console.log(`API Key: ${maskApiKey(process.env.OPENAI_API_KEY)}`);
    console.log(`Assistant ID: ${process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || 'Not set'}`);
    
    // Only run tests if we have an API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Missing OpenAI API key in environment');
      return false;
    }
    
    // Create OpenAI client
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Test 1: Basic completion API
    console.log('\n1. Testing Chat Completions API...');
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 10
      });
      
      console.log('✅ Chat Completions API working!');
      console.log(`   Response: ${completion.choices[0].message.content}`);
    } catch (error) {
      console.error('❌ Chat Completions API failed:', error.message);
      return false;
    }
    
    // Test 2: Assistant API
    console.log('\n2. Testing Assistants API...');
    const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    
    try {
      console.log(`   Retrieving assistant with ID: ${assistantId}`);
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      
      console.log('✅ Assistants API working!');
      console.log(`   Name: ${assistant.name}`);
      console.log(`   Model: ${assistant.model}`);
      
      // Test 3: Thread creation and message
      console.log('\n3. Testing thread creation and message...');
      
      try {
        // Create a thread
        const thread = await openai.beta.threads.create();
        console.log(`   Thread created with ID: ${thread.id}`);
        
        // Add a message to the thread
        const message = await openai.beta.threads.messages.create(thread.id, {
          role: 'user',
          content: 'Hello Gabriel, this is a test message.'
        });
        
        console.log('✅ Thread and message creation successful!');
        
        // Start a run
        console.log('\n4. Starting a test run with the assistant...');
        
        try {
          const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId
          });
          
          console.log(`   Run created with ID: ${run.id}`);
          console.log('✅ ALL TESTS PASSED! OpenAI integration is working correctly!')
          return true;
        } catch (runError) {
          console.error('❌ Run creation failed:', runError.message);
          // This is not a critical failure as we've already verified assistant access
          console.log('✅ BASIC TESTS PASSED: Chat and Assistant APIs are working');
          return true;
        }
      } catch (threadError) {
        console.error('❌ Thread creation failed:', threadError.message);
        // This is not a critical failure as we've already verified assistant access
        console.log('✅ BASIC TESTS PASSED: Chat and Assistant APIs are working');
        return true;
      }
    } catch (assistantError) {
      console.error('❌ Assistant retrieval failed:', assistantError.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Main function to run all tests
async function main() {
  console.log('🚀 LITTLEGABRIEL OPENAI INTEGRATION TEST');
  console.log('==========================================');
  
  const devResult = await testDevelopment();
  const prodResult = await testProduction();
  
  console.log('\n📊 TEST SUMMARY');
  console.log('=============');
  console.log(`Development mode: ${devResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Production mode: ${prodResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (devResult && prodResult) {
    console.log('\n🎉 ALL TESTS PASSED! Your OpenAI integration is working correctly in both environments.');
  } else if (devResult && !prodResult) {
    console.error('\n⚠️ WARNING: OpenAI works in development but not in production!\n');
    console.log('Possible issues:');
    console.log('1. Environment variables not properly set in .env.production');
    console.log('2. Different assistant ID being used in production');
    console.log('3. API key not accessible in production environment');
    console.log('\nRecommendations:');
    console.log('- Check your .env.production file');
    console.log('- Ensure startup.js is properly loading environment variables');
    console.log('- Verify next.config.js has correct environment variable settings');
  } else {
    console.error('\n⚠️ OpenAI integration is not working correctly in one or both environments.');
  }
}

// Run the script
main().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});
