/**
 * Test Assistant Access
 * 
 * This script attempts to access the Gabriel assistant directly
 * using the provided API key and assistant ID to diagnose any permission issues.
 */

require('dotenv').config();
const { OpenAI } = require('openai');

// Get the API key from environment
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY not found in environment');
  process.exit(1);
}

// Assistant ID to test
const assistantId = 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

// Create OpenAI client
const openai = new OpenAI({ apiKey });

// Test function to retrieve the assistant
async function testAssistantAccess() {
  console.log(`\n📝 Testing access to assistant ID: ${assistantId}`);
  console.log(`Using API key: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    // Attempt to retrieve the assistant
    console.log('Attempting to retrieve assistant...');
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    console.log('✅ Success! Assistant details:');
    console.log(`- Name: ${assistant.name}`);
    console.log(`- Model: ${assistant.model}`);
    console.log(`- Created at: ${new Date(assistant.created_at * 1000).toLocaleString()}`);
    console.log(`- Last modified: ${new Date(assistant.updated_at * 1000).toLocaleString()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error accessing assistant:');
    console.error(`- Status: ${error.status}`);
    console.error(`- Message: ${error.message}`);
    console.error(`- Type: ${error.type}`);
    
    if (error.status === 404) {
      console.log('\n🔍 DIAGNOSIS: The assistant ID exists but is not accessible with this API key.');
      console.log('This likely means:');
      console.log('1. The assistant was created with a different OpenAI account/organization');
      console.log('2. The API key being used belongs to a different account/organization');
      console.log('3. The assistant might have been deleted from the account');
      
      console.log('\nSOLUTIONS:');
      console.log('1. Verify you\'re using the API key from the same account where the assistant was created');
      console.log('2. Check if organization settings are causing permission issues');
      console.log('3. Consider creating a new assistant in the current account');
    }
    
    return false;
  }
}

// Run the test
testAssistantAccess()
  .then(() => console.log('\nTest completed.'))
  .catch(err => console.error('Unhandled error:', err));
