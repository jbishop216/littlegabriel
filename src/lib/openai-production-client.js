/**
 * Production-optimized OpenAI client
 */

const OpenAI = require('openai');

// Singleton instance
let client = null;

// Create OpenAI client with optimal settings
function createOpenAIClient() {
  if (client) return client;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Missing OpenAI API key');
    throw new Error('OpenAI API key not found');
  }
  
  try {
    console.log('Creating OpenAI client with API key:', apiKey.substring(0, 4) + '...');
    client = new OpenAI({
      apiKey,
      maxRetries: 3,
      timeout: 60000
    });
    return client;
  } catch (error) {
    console.error('Failed to create OpenAI client:', error.message);
    throw error;
  }
}

// Get assistant ID from environment
function getAssistantId() {
  return (
    process.env.OPENAI_ASSISTANT_ID ||
    process.env.ASSISTANT_ID ||
    'asst_BpFiJmyhoHFYUj5ooLEoHEX2'
  );
}

// Test OpenAI API connectivity
async function testOpenAIConnection() {
  try {
    const client = createOpenAIClient();
    
    console.log('Testing OpenAI API connection...');
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello! This is a test.' }],
      max_tokens: 20,
    });
    
    console.log('OpenAI connection successful:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('OpenAI test failed:', error.message);
    return false;
  }
}

// Test assistant access
async function testAssistantAccess() {
  try {
    const client = createOpenAIClient();
    const assistantId = getAssistantId();
    
    console.log('Testing assistant access:', assistantId);
    const assistant = await client.beta.assistants.retrieve(assistantId);
    
    console.log('Assistant access successful:', assistant.name);
    return true;
  } catch (error) {
    console.error('Assistant access failed:', error.message);
    return false;
  }
}

module.exports = {
  createOpenAIClient,
  getAssistantId,
  testOpenAIConnection,
  testAssistantAccess
};
