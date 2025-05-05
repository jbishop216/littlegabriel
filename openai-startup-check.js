/**
 * OpenAI Connection Startup Check
 * 
 * This script verifies OpenAI connectivity at application startup
 * and logs detailed diagnostics to help identify issues in production.
 */

const OpenAI = require('openai');

async function checkOpenAIConnection() {
  console.log('\n🔍 CHECKING OPENAI CONNECTION AT STARTUP');
  console.log('======================================');
  
  // 1. Check environment variables
  console.log('\n📋 Environment Variables:');
  
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID;
  
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`OPENAI_API_KEY present: ${!!apiKey}`);
  if (apiKey) {
    console.log(`API Key first 4 chars: ${apiKey.substring(0, 4)}`);
    console.log(`API Key length: ${apiKey.length}`);
  }
  console.log(`OPENAI_ASSISTANT_ID: ${assistantId || 'not set'}`);
  console.log(`ASSISTANT_ID: ${process.env.ASSISTANT_ID || 'not set'}`);
  
  if (!apiKey) {
    console.error('❌ ERROR: OPENAI_API_KEY environment variable is missing!');
    return false;
  }
  
  // 2. Try to create an OpenAI client
  try {
    console.log('\n🔌 Creating OpenAI client...');
    const openai = new OpenAI({ apiKey });
    console.log('✅ OpenAI client created successfully');
    
    // 3. Try a simple completion to verify connectivity
    try {
      console.log('\n🔄 Testing API connectivity with a simple completion...');
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello, this is a startup test.' }],
        max_tokens: 10
      });
      
      console.log(`✅ Completion successful! Response: "${completion.choices[0].message.content}"`);
      console.log(`Model used: ${completion.model}`);
      
      // 4. Check assistant access if assistant ID is available
      if (assistantId) {
        try {
          console.log(`\n🤖 Testing access to assistant: ${assistantId}`);
          const assistant = await openai.beta.assistants.retrieve(assistantId);
          
          console.log(`✅ Assistant access successful!`);
          console.log(`Assistant name: ${assistant.name}`);
          console.log(`Assistant model: ${assistant.model}`);
          
          console.log('\n🎉 ALL OPENAI CHECKS PASSED! The integration is working correctly.');
          return true;
        } catch (assistantError) {
          console.error(`❌ Assistant access error: ${assistantError.message}`);
          console.log('⚠️ Basic API works but assistant access failed!');
          
          if (assistantError.message.includes('No such assistant')) {
            console.error(`The assistant ID '${assistantId}' does not exist or is not accessible with this API key.`);
          }
          
          // API is working but assistant has issues
          return true;
        }
      } else {
        console.log('\n⚠️ No assistant ID provided, skipping assistant check.');
        console.log('🎉 BASIC OPENAI FUNCTIONALITY IS WORKING!');
        return true;
      }
      
    } catch (completionError) {
      console.error(`❌ API connectivity test failed: ${completionError.message}`);
      console.error('Details:', {
        errorType: completionError.constructor.name,
        statusCode: completionError.status || 'unknown'
      });
      
      if (completionError.message.includes('auth')) {
        console.error('🔑 This appears to be an authentication issue. Check if your API key is valid.');
      } else if (completionError.message.includes('timeout')) {
        console.error('⏱️ The request timed out. There might be connectivity issues.');
      }
      
      return false;
    }
    
  } catch (clientError) {
    console.error(`❌ Failed to create OpenAI client: ${clientError.message}`);
    return false;
  }
}

// Run the check and log the result
checkOpenAIConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ OpenAI startup check completed successfully!');
    } else {
      console.error('\n❌ OpenAI startup check failed! Application may have limited functionality.');
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error during OpenAI startup check:', error);
  });
