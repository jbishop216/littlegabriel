/**
 * Simple script to test OpenAI Assistant in a production environment
 */

const { OpenAI } = require('openai');

// Force production mode
process.env.NODE_ENV = 'production';

// Ensure we use our OpenAI Assistant
process.env.FORCE_OPENAI_ASSISTANT = 'true';

async function testOpenAIAssistant() {
  try {
    console.log('Testing OpenAI Assistant with these environment settings:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('FORCE_OPENAI_ASSISTANT:', process.env.FORCE_OPENAI_ASSISTANT);
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Present (starts with ' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : 'Missing');
    console.log('OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID || 'Using default: asst_BpFiJmyhoHFYUj5ooLEoHEX2');
    console.log('\n');
    
    // Create OpenAI instance with the same settings as our production app
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    console.log('Attempting to retrieve assistant:', assistantId);
    
    // Try to retrieve the assistant
    console.log('Retrieving assistant...');
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    console.log('\n✅ Successfully retrieved assistant!');
    console.log('Assistant Details:');
    console.log('- Name:', assistant.name);
    console.log('- ID:', assistant.id);
    console.log('- Model:', assistant.model);
    
    // Create a thread
    console.log('\nCreating a test thread...');
    const thread = await openai.beta.threads.create();
    console.log('Thread created with ID:', thread.id);
    
    // Add a message to the thread
    console.log('\nAdding a test message to the thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: 'Hello Gabriel, can you tell me what the Bible says about faith?'
    });
    console.log('Message added successfully');
    
    // Run the assistant
    console.log('\nRunning the assistant...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });
    console.log('Run created with ID:', run.id);
    
    // Poll for completion
    console.log('\nWaiting for run to complete...');
    const completedRun = await pollRunStatus(openai, thread.id, run.id);
    console.log('Run completed with status:', completedRun.status);
    
    // Get messages
    console.log('\nRetrieving assistant response...');
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the assistant's response
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length > 0) {
      console.log('\n✅ Assistant response received:');
      console.log('-'.repeat(50));
      console.log(assistantMessages[0].content[0].text.value);
      console.log('-'.repeat(50));
      console.log('\nTest successful! Assistant is working correctly in production mode.');
    } else {
      console.log('⚠️ No assistant response received.');
    }
    
    return { success: true };
  } catch (error) {
    console.error('\n❌ Error testing OpenAI Assistant:', error.message);
    if (error.status) {
      console.error('Status code:', error.status);
    }
    if (error.error) {
      console.error('Error details:', error.error);
    }
    return { success: false, error };
  }
}

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

// Run the test
testOpenAIAssistant()
  .then(result => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });
