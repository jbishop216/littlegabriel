/**
 * Test OpenAI connectivity and Assistant configuration
 */

require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testOpenAI() {
  console.log('\n📊 OpenAI API Test Starting');
  console.log('===========================');
  
  // Test environment variables
  console.log('\n🔍 Environment variables check:');
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID;
  
  console.log(`OPENAI_API_KEY present: ${!!apiKey}`);
  if (apiKey) {
    console.log(`API Key starts with: ${apiKey.substring(0, 4)}...`);
    console.log(`API Key length: ${apiKey.length} characters`);
  } else {
    console.error('⚠️ ERROR: OPENAI_API_KEY is missing!');
    process.exit(1);
  }
  
  console.log(`OPENAI_ASSISTANT_ID: ${assistantId || 'not set'}`);
  console.log(`ASSISTANT_ID: ${process.env.ASSISTANT_ID || 'not set'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize OpenAI client
  try {
    console.log('\n🔌 Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey,
      maxRetries: 2,
      timeout: 30000
    });
    console.log('✅ OpenAI client created successfully');
    
    // Test basic chat completion
    console.log('\n💬 Testing basic chat completion...');
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Say hello!' }],
        max_tokens: 20
      });
      
      console.log(`✅ Chat completion successful!`);
      console.log(`Response: "${completion.choices[0].message.content}"`); 
      console.log(`Model used: ${completion.model}`);
    } catch (error) {
      console.error('❌ Chat completion failed:', error.message);
      throw error;
    }
    
    // Test assistant access
    if (assistantId) {
      console.log(`\n🤖 Testing access to assistant: ${assistantId}`);
      try {
        const assistant = await openai.beta.assistants.retrieve(assistantId);
        console.log(`✅ Assistant access successful!`);
        console.log(`Assistant name: ${assistant.name}`);
        console.log(`Assistant model: ${assistant.model}`);
        console.log(`Created at: ${new Date(assistant.created_at * 1000).toISOString()}`);
        
        // Test thread creation
        console.log('\n🧵 Testing thread creation...');
        const thread = await openai.beta.threads.create();
        console.log(`✅ Thread created with ID: ${thread.id}`);
        
        // Test message creation
        console.log('\n📝 Testing message creation...');
        const message = await openai.beta.threads.messages.create(
          thread.id,
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        );
        console.log(`✅ Message created with ID: ${message.id}`);
        
        // Test run creation
        console.log('\n🏃 Testing run creation...');
        const run = await openai.beta.threads.runs.create(
          thread.id,
          { assistant_id: assistantId }
        );
        console.log(`✅ Run created with ID: ${run.id}`);
        console.log(`Initial status: ${run.status}`);
        
        // Poll for run completion
        console.log('\n⏳ Polling for run completion...');
        const completedRun = await pollRunStatus(openai, thread.id, run.id);
        console.log(`✅ Run completed with status: ${completedRun.status}`);
        
        // Get response messages
        console.log('\n📨 Getting assistant messages...');
        const messages = await openai.beta.threads.messages.list(thread.id);
        
        // Find assistant messages (filter out the user message we sent)
        const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
        
        if (assistantMessages.length > 0) {
          console.log(`✅ Received ${assistantMessages.length} assistant message(s)`);
          const content = assistantMessages[0].content[0].text.value;
          console.log(`Response: "${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"`);
        } else {
          console.log('❓ No assistant messages found. This might be expected if the run is still in progress.');
        }
      } catch (error) {
        console.error(`\n❌ Assistant access failed: ${error.message}`);
        
        if (error.message.includes('No such assistant')) {
          console.error(`The assistant ID ${assistantId} does not exist or is not accessible with your API key.`);
        } else if (error.message.includes('permission')) {
          console.error('Your API key does not have permission to access this assistant.');
        }
      }
    } else {
      console.log('\n⚠️ No assistant ID provided, skipping assistant tests.');
    }
    
    console.log('\n🎉 OpenAI test completed successfully!');
  } catch (error) {
    console.error(`\n❌ OpenAI test failed: ${error.message}`);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

async function pollRunStatus(openai, threadId, runId, maxAttempts = 10) {
  let attempts = 0;
  let run;
  
  while (attempts < maxAttempts) {
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log(`  Status: ${run.status} (attempt ${attempts + 1}/${maxAttempts})`);
    
    if (run.status === 'completed' || 
        run.status === 'failed' || 
        run.status === 'cancelled' || 
        run.status === 'expired') {
      break;
    }
    
    // Wait between polls
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  return run;
}

// Run the test
testOpenAI().catch(console.error);
