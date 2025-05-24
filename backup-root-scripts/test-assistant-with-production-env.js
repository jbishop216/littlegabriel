/**
 * Test OpenAI Assistant with Production Environment
 */

// Force production environment
process.env.NODE_ENV = 'production';

// Load production environment variables
require('dotenv').config({ path: '.env.production' });

// Force assistant mode (this simulates our fix)
process.env.FORCE_OPENAI_ASSISTANT = 'true';

const { OpenAI } = require('openai');

async function testAssistantInProduction() {
  console.log('=== Testing Assistant in Production Environment ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('FORCE_OPENAI_ASSISTANT:', process.env.FORCE_OPENAI_ASSISTANT);
  console.log('FORCE_OPENAI_FALLBACK:', process.env.FORCE_OPENAI_FALLBACK);
  
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  
  console.log('API Key First 10 chars:', apiKey.substring(0, 10) + '...');
  console.log('API Key Last 4 chars:', apiKey.substring(apiKey.length - 4));
  console.log('API Key Length:', apiKey.length);
  console.log('Assistant ID:', assistantId);
  
  // Test OpenAI connection
  try {
    console.log('\nTesting OpenAI connection...');
    const openai = new OpenAI({ apiKey });
    
    // Try to retrieve the assistant
    console.log('\nAttempting to retrieve assistant...');
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      console.log('✓ Successfully retrieved assistant:', assistant.name);
      
      // Create a thread for testing
      console.log('\nCreating test thread...');
      const thread = await openai.beta.threads.create();
      console.log('Thread created:', thread.id);
      
      // Add a message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: 'Hello, Gabriel. Please give me a brief greeting.'
      });
      console.log('Message added to thread');
      
      // Run the assistant on the thread
      console.log('\nRunning assistant...');
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
      });
      console.log('Run created:', run.id);
      
      // Poll for completion
      console.log('\nPolling for completion...');
      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      let attempts = 0;
      while (runStatus.status !== 'completed' && attempts < 10) {
        console.log('Current status:', runStatus.status);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        attempts++;
      }
      
      console.log('Final run status:', runStatus.status);
      
      // Get the assistant's response
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread.id);
        console.log('\nAssistant response:');
        const assistantMessage = messages.data.find(m => m.role === 'assistant');
        if (assistantMessage && assistantMessage.content[0].type === 'text') {
          console.log(assistantMessage.content[0].text.value);
          console.log('\n✓ SUCCESS: Assistant API working correctly in production environment!');
        } else {
          console.log('No text response found');
        }
      } else {
        console.log('✗ Run did not complete successfully');
      }
    } catch (assistantError) {
      console.error('✗ Failed to retrieve assistant:', assistantError.message);
    }
  } catch (error) {
    console.error('✗ OpenAI connection failed:', error.message);
  }
}

testAssistantInProduction().catch(console.error);
