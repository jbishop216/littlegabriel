/**
 * Test OpenAI API in production environment
 */

// Force production environment
process.env.NODE_ENV = 'production';

// Load environment variables from production file
require('dotenv').config({ path: '.env.production' });

const { OpenAI } = require('openai');

async function testProductionAPIKey() {
  console.log('=== Production Environment Test ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('API Key First 10 chars:', apiKey.substring(0, 10) + '...');
  console.log('API Key Last 4 chars:', apiKey.substring(apiKey.length - 4));
  console.log('API Key Length:', apiKey.length);
  console.log('Assistant ID:', process.env.OPENAI_ASSISTANT_ID || 'Not Set');
  
  // Test OpenAI connection
  try {
    console.log('\nTesting OpenAI connection...');
    const openai = new OpenAI({ apiKey });
    
    // Get models (lightweight API call)
    const models = await openai.models.list();
    console.log('✓ Connection successful - Found', models.data.length, 'models');
    console.log('Sample models:', models.data.slice(0, 3).map(m => m.id));
    
    // Try to retrieve the assistant
    console.log('\nAttempting to retrieve assistant...');
    try {
      const assistant = await openai.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT_ID);
      console.log('✓ Successfully retrieved assistant:', assistant.name);
    } catch (assistantError) {
      console.error('✗ Failed to retrieve assistant:', assistantError.message);
      
      // List available assistants
      console.log('\nListing available assistants...');
      const assistants = await openai.beta.assistants.list();
      console.log('Found', assistants.data.length, 'assistants:');
      assistants.data.forEach(a => {
        console.log(`- ${a.id} (${a.name || 'Unnamed'})`);
      });
    }
  } catch (error) {
    console.error('✗ OpenAI connection failed:', error.message);
  }
}

testProductionAPIKey().catch(console.error);
