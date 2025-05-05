/**
 * Check OpenAI Assistant ID specifically
 * This script is designed to verify the Gabriel assistant is accessible
 */

require('dotenv').config();
const { OpenAI } = require('openai');

async function checkAssistant() {
  console.log('🔍 Checking OpenAI Assistant Configuration');
  console.log('=========================================');
  
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment');
    return false;
  }
  
  // Check for Assistant ID
  if (!process.env.OPENAI_ASSISTANT_ID) {
    console.error('❌ OPENAI_ASSISTANT_ID is not set in environment');
    return false;
  }

  const assistantId = process.env.OPENAI_ASSISTANT_ID;
  console.log(`🔍 Using OpenAI Assistant ID: ${assistantId}`);

  try {
    // Initialize the OpenAI client
    console.log('📡 Connecting to OpenAI API...');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Test Assistant retrieval
    console.log(`🤖 Retrieving assistant with ID: ${assistantId}`);
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      console.log(`✅ Assistant retrieved successfully:`);
      console.log(`   - Name: ${assistant.name}`);
      console.log(`   - Model: ${assistant.model}`);
      console.log(`   - Created At: ${new Date(assistant.created_at * 1000).toLocaleString()}`);
      return true;
    } catch (assistantError) {
      console.error(`❌ Failed to retrieve assistant: ${assistantError.message}`);
      
      if (assistantError.message.includes('No such assistant')) {
        console.error('\n⚠️ THE ASSISTANT ID IS INCORRECT OR DOES NOT EXIST ⚠️');
        console.error('Please check for typos or case sensitivity in the Assistant ID.');
        console.error(`Current value: ${assistantId}`);
        
        // Try to list assistants to help troubleshooting
        console.log('\n📋 Available Assistants:');
        try {
          const assistants = await openai.beta.assistants.list({ limit: 10 });
          if (assistants.data.length === 0) {
            console.log('   No assistants found in this account.');
          } else {
            assistants.data.forEach(ast => {
              console.log(`   - ID: ${ast.id} | Name: ${ast.name || 'unnamed'} | Model: ${ast.model}`);
            });
          }
        } catch (listError) {
          console.error(`   Could not list assistants: ${listError.message}`);
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

// If this script is run directly
if (require.main === module) {
  checkAssistant()
    .then(success => {
      if (!success) {
        console.error('\n❌ Assistant check failed. Application will not function correctly!');
        process.exit(1);
      } else {
        console.log('\n✅ Assistant check completed successfully!');
      }
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      process.exit(1);
    });
}

// Export for use in other scripts
module.exports = { checkAssistant };