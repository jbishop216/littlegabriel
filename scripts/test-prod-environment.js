/**
 * Test Production Environment Settings
 * 
 * This script tests that the OpenAI Assistant works properly in a simulated
 * production environment. It's designed to help troubleshoot issues that only
 * appear in production without having to actually deploy the app.
 */

const fs = require('fs');
const path = require('path');

// Force production environment
process.env.NODE_ENV = 'production';
process.env.FORCE_OPENAI_ASSISTANT = 'true';

// Import only after setting environment variables
const { shouldUseFallback } = require('../src/lib/openai-fallback-check');
const { OpenAI } = require('openai');

// Detailed environment check
function checkEnvironment() {
  console.log('=== Environment Variables ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('FORCE_OPENAI_ASSISTANT:', process.env.FORCE_OPENAI_ASSISTANT);
  console.log('FORCE_OPENAI_FALLBACK:', process.env.FORCE_OPENAI_FALLBACK);
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present (starts with ' + process.env.OPENAI_API_KEY.substring(0, 5) + '...)' : 'Missing');
  console.log('OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID || 'Not set, will use default');
  
  console.log('\n=== Fallback Settings ===');
  const useFallback = shouldUseFallback();
  console.log('Should use fallback mode:', useFallback ? 'YES' : 'NO');
  console.log('Mode:', useFallback ? 'Fallback API' : 'Assistant API');
  
  if (useFallback) {
    console.log('\n\u26a0\ufe0f WARNING: The system is configured to use fallback mode,');
    console.log('which means it will NOT use the OpenAI Assistant API.');  
    console.log('This is likely not what you want for production testing.');
  } else {
    console.log('\n\u2705 The system is configured to use the OpenAI Assistant API.');
  }
  
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.log('\n\u26a0\ufe0f ERROR: No OpenAI API key found in the environment.');
    return false;
  }
  
  return true;
}

// Test the OpenAI API connection
async function testOpenAIConnection() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  try {
    console.log('\n=== OpenAI API Test ===');
    console.log('Testing basic API connectivity...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',  // Use a smaller model for quick testing
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello!' }
      ],
      max_tokens: 20
    });
    
    console.log('\n\u2705 OpenAI API connection successful!');
    console.log('Response: "' + response.choices[0].message.content + '"');
    return true;
  } catch (error) {
    console.log('\n\u26a0\ufe0f ERROR: Failed to connect to OpenAI API');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    return false;
  }
}

// Test the OpenAI Assistant
async function testOpenAIAssistant() {
  try {
    console.log('\n=== OpenAI Assistant Test ===');
    
    // Set up OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Get assistant ID
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    console.log('Using Assistant ID:', assistantId);
    
    // Get assistant details
    console.log('Retrieving assistant details...');
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    console.log('\n\u2705 Assistant retrieved successfully!');
    console.log('Name:', assistant.name);
    console.log('ID:', assistant.id);
    console.log('Model:', assistant.model);
    
    // Create a test thread
    console.log('\nCreating test thread...');
    const thread = await openai.beta.threads.create();
    console.log('Thread created with ID:', thread.id);
    
    // Add a simple message
    console.log('Adding test message...');
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Tell me about Jesus in one sentence.'
    });
    
    // Run the assistant
    console.log('Running assistant on thread...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    
    // Poll for completion
    console.log('Waiting for run to complete...');
    console.log('(This might take 15-30 seconds)');
    const completedRun = await pollRunStatus(openai, thread.id, run.id);
    
    if (completedRun.status === 'completed') {
      // Get messages
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length > 0) {
        console.log('\n\u2705 Assistant responded successfully!');
        console.log('Response:');
        console.log('-'.repeat(50));
        console.log(assistantMessages[0].content[0].text.value);
        console.log('-'.repeat(50));
        return true;
      } else {
        console.log('\n\u26a0\ufe0f No assistant messages found in thread.');
        return false;
      }
    } else {
      console.log(`\n\u26a0\ufe0f Run failed with status: ${completedRun.status}`);
      return false;
    }
  } catch (error) {
    console.log('\n\u26a0\ufe0f ERROR: Failed to test OpenAI Assistant');
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
    return false;
  }
}

// Helper function to poll for run status
async function pollRunStatus(openai, threadId, runId, maxAttempts = 30) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'expired') {
      return run;
    }
    
    console.log(`Run status: ${run.status} (polling ${attempts + 1}/${maxAttempts})`);
    attempts++;
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Max polling attempts reached');
}

// Main function
async function main() {
  console.log('======= PRODUCTION ENVIRONMENT TEST =======\n');
  
  const envOk = checkEnvironment();
  if (!envOk) {
    console.log('\nEnvironment check failed. Fix the issues above before continuing.');
    return 1;
  }
  
  const apiOk = await testOpenAIConnection();
  if (!apiOk) {
    console.log('\nOpenAI API test failed. Fix API connection issues before continuing.');
    return 1;
  }
  
  const assistantOk = await testOpenAIAssistant();
  if (!assistantOk) {
    console.log('\nOpenAI Assistant test failed. Review the errors above.');
    return 1;
  }
  
  console.log('\n======= TEST RESULTS =======');
  console.log('Environment Check:', envOk ? '\u2705 PASSED' : '\u26a0\ufe0f FAILED');
  console.log('OpenAI API Test:', apiOk ? '\u2705 PASSED' : '\u26a0\ufe0f FAILED');
  console.log('OpenAI Assistant Test:', assistantOk ? '\u2705 PASSED' : '\u26a0\ufe0f FAILED');
  
  if (envOk && apiOk && assistantOk) {
    console.log('\n\u2705 ALL TESTS PASSED!');
    console.log('The OpenAI Assistant is working correctly in a production-like environment.');
    return 0;
  } else {
    console.log('\n\u26a0\ufe0f SOME TESTS FAILED');
    console.log('Review the errors above and fix the issues before deploying to production.');
    return 1;
  }
}

// Run the main function
main()
  .then(exitCode => {
    // Exit with the appropriate code
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
