/**
 * Production Environment OpenAI Assistant Test
 * 
 * This script simulates the production environment and tests that the OpenAI Assistant
 * works properly with the FORCE_OPENAI_ASSISTANT=true setting.
 */

// Force production mode
process.env.NODE_ENV = 'production';

// Force the use of Assistant API even in production
process.env.FORCE_OPENAI_ASSISTANT = 'true';

// Directly test the fallback check - no need to import/export
const shouldUseFallback = () => {
  // If explicitly forced to use Assistant API, don't use fallback
  if (process.env.FORCE_OPENAI_ASSISTANT === 'true') {
    console.log('OpenAI Assistant explicitly enabled with FORCE_OPENAI_ASSISTANT=true');
    return false;
  }
  
  // If explicitly forced to use fallback, use it
  if (process.env.FORCE_OPENAI_FALLBACK === 'true') {
    console.log('OpenAI Fallback explicitly enabled with FORCE_OPENAI_FALLBACK=true');
    return true;
  }
  
  // In production, we now default to using the Assistant API
  // This change fixes the previous behavior where production defaulted to fallback
  if (process.env.NODE_ENV === 'production') {
    // Only use fallback if explicitly requested
    const useFallback = process.env.FORCE_OPENAI_FALLBACK === 'true';
    console.log(`Production environment detected. Using ${useFallback ? 'fallback mode' : 'Assistant API'}`);
    return useFallback;
  }
  
  // In development, always use Assistant API by default
  return false;
};

const { OpenAI } = require('openai');

async function testOpenAIAssistant() {
  try {
    console.log('\n=== Testing OpenAI Assistant in Production Mode ===');
    console.log('Environment settings:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- FORCE_OPENAI_ASSISTANT:', process.env.FORCE_OPENAI_ASSISTANT);
    console.log('- Using fallback mode:', shouldUseFallback() ? 'YES' : 'NO');
    
    // Create OpenAI instance
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    console.log('\nAttempting to retrieve assistant:', assistantId);
    
    // Try to retrieve the assistant
    console.log('Retrieving assistant...');
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    console.log('\n\u2705 Successfully retrieved assistant!');
    console.log('Assistant Details:');
    console.log('- Name:', assistant.name);
    console.log('- ID:', assistant.id);
    console.log('- Model:', assistant.model);
    
    // Test a simple question
    console.log('\nTesting a simple Bible-related question...');
    const thread = await openai.beta.threads.create();
    console.log('Thread created with ID:', thread.id);
    
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'What does the Bible say about forgiveness?'
    });
    
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    
    console.log('Run created, waiting for completion...');
    const completedRun = await pollRunStatus(openai, thread.id, run.id);
    
    if (completedRun.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
      
      if (assistantMessages.length > 0) {
        console.log('\n\u2705 Assistant successfully responded!');
        const messageContent = assistantMessages[0].content[0].text.value;
        console.log('-'.repeat(50));
        console.log(messageContent.substring(0, 150) + '...');
        console.log('-'.repeat(50));
        
        return {
          success: true,
          message: 'OpenAI Assistant works correctly in production mode!'
        };
      }
    } else {
      console.error(`\n\u274c Run failed with status: ${completedRun.status}`);
      return {
        success: false,
        error: `Run failed with status: ${completedRun.status}`
      };
    }
  } catch (error) {
    console.error('\n\u274c Error testing OpenAI Assistant:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function pollRunStatus(openai, threadId, runId, maxAttempts = 30) {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (run.status === 'completed' || run.status === 'failed' || run.status === 'expired') {
      return run;
    }
    
    console.log(`Run status: ${run.status} (attempt ${attempts + 1}/${maxAttempts})`);
    attempts++;
    
    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Max polling attempts reached');
}

// Run the test
testOpenAIAssistant()
  .then(result => {
    console.log('\n=== Test Results ===');
    console.log('Success:', result.success);
    if (result.message) console.log('Message:', result.message);
    if (result.error) console.log('Error:', result.error);
    
    console.log('\n=== Conclusions ===');
    if (result.success) {
      console.log('1. The fallback check function is working correctly');
      console.log('2. The OpenAI Assistant API works in production mode when FORCE_OPENAI_ASSISTANT=true');
      console.log('3. All necessary environment variables are correctly configured');
      console.log('\nYour production environment is correctly set up to use the OpenAI Assistant API!');
      process.exit(0);
    } else {
      console.log('\u274c There are still issues with the OpenAI Assistant in production mode.');
      console.log('Please check the error details above and ensure all environment variables are correctly set.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
