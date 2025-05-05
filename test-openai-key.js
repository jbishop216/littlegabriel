/**
 * Simple test for OpenAI API key
 */

require('dotenv').config();
const { OpenAI } = require('openai');

async function testOpenAIKey() {
  console.log('🔑 Testing OpenAI API Key');
  console.log('======================');
  
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in environment');
    return;
  }
  
  try {
    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Test basic API connectivity
    console.log('Testing API connectivity...');
    const models = await openai.models.list();
    console.log(`✅ API Connection successful. Found ${models.data.length} models.`);
    
    // Get the first few models
    console.log('\nSample available models:');
    const topModels = models.data
      .filter(model => model.id.startsWith('gpt-'))
      .slice(0, 5);
    
    topModels.forEach(model => {
      console.log(`- ${model.id}`);
    });
    
    // Use a simple completion to verify functionality
    console.log('\nTesting simple completion...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant for LittleGabriel, a faith-based counseling service." },
        { role: "user", content: "Hello, can you provide a brief verse of encouragement?" }
      ],
      max_tokens: 100
    });
    
    console.log('\nResponse:');
    console.log('-------------------------');
    console.log(completion.choices[0].message.content);
    console.log('-------------------------');
    
    console.log('\n✅ OpenAI API key test completed successfully!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the test
testOpenAIKey().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});