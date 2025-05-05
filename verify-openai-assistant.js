/**
 * OpenAI Assistant ID Verification Tool
 * 
 * This script performs a comprehensive check of your OpenAI API key
 * and assistant ID to verify if they are valid and accessible.
 * 
 * It will:
 * 1. Check if your API key is valid
 * 2. List all available assistants
 * 3. Try to retrieve the specific assistant by ID
 * 4. Provide recommendations if issues are found
 */

const { OpenAI } = require('openai');
require('dotenv').config();

// Get the API key from environment, or use an example for display purposes
const apiKey = process.env.OPENAI_API_KEY;
// Get the Assistant ID from environment, or use the one from your config
const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

// Display masked key for logging
function maskApiKey(key) {
  if (!key) return '[NOT SET]';
  return `${key.substring(0, 4)}...${key.substring(key.length - 3)}`;
}

async function verifyOpenAISetup() {
  console.log('🔍 OpenAI Verification Tool');
  console.log('==========================');
  console.log(`API Key: ${maskApiKey(apiKey)}`);
  console.log(`Assistant ID: ${assistantId}`);
  console.log('');

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment');
    return;
  }

  try {
    // Initialize the OpenAI client
    console.log('1️⃣ Connecting to OpenAI API...');
    const openai = new OpenAI({
      apiKey: apiKey
    });

    // First test - Make a simple completion request to verify the API key
    console.log('\n2️⃣ Testing API key validity...');
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, this is a test message." }],
        max_tokens: 5
      });
      console.log(`✅ API key is valid. Response: "${completion.choices[0].message.content}"`);
    } catch (error) {
      console.error(`❌ API key test failed: ${error.message}`);
      console.log('\nRecommendation: Check your OpenAI API key and update it in your environment variables.');
      return;
    }

    // Second test - List assistants to see what's available
    console.log('\n3️⃣ Listing available assistants...');
    try {
      const assistants = await openai.beta.assistants.list({ limit: 10 });
      console.log(`✅ Found ${assistants.data.length} assistants:`);
      
      // Display all assistants with their IDs and models
      assistants.data.forEach((assistant, index) => {
        console.log(`   ${index + 1}. ID: ${assistant.id} | Name: ${assistant.name || '[Unnamed]'} | Model: ${assistant.model}`);
      });
      
      // Check if our target assistant is in the list
      const found = assistants.data.find(a => a.id === assistantId);
      if (found) {
        console.log(`\n✅ The assistant "${assistantId}" was found in your list of assistants.`);
      } else {
        console.log(`\n⚠️ The assistant "${assistantId}" was NOT found in your list of assistants.`);
      }
    } catch (error) {
      console.error(`❌ Listing assistants failed: ${error.message}`);
    }

    // Third test - Try to retrieve the specific assistant
    console.log(`\n4️⃣ Retrieving assistant with ID: ${assistantId}...`);
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      console.log(`✅ Assistant found!`);
      console.log(`   Name: ${assistant.name || '[Unnamed]'}`);
      console.log(`   Model: ${assistant.model}`);
      console.log(`   Created: ${new Date(assistant.created_at * 1000).toLocaleString()}`);
    } catch (error) {
      console.error(`❌ Failed to retrieve assistant: ${error.message}`);
      console.log('\nRecommendations:');
      console.log('1. Double-check the assistant ID for typos or case-sensitivity');
      console.log('2. Verify that the assistant exists in your OpenAI account');
      console.log('3. Check if the assistant was deleted or replaced');
      console.log('4. Ensure you\'re using the same OpenAI account/organization as when the assistant was created');
    }

  } catch (error) {
    console.error(`❌ General error: ${error.message}`);
  }
}

// Execute the verification
verifyOpenAISetup().catch(error => {
  console.error('Uncaught error:', error);
});