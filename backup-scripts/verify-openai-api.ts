/**
 * OpenAI API Verification Tool
 * 
 * This script performs a complete check of your OpenAI API key and assistant configuration
 * to ensure they are working correctly for deployment.
 */
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env files
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Mask API key for logging
function maskApiKey(key: string | undefined): string {
  if (!key) return 'undefined';
  if (key.length < 8) return '***';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

async function verifyOpenAI() {
  console.log('\nOpenAI API Verification Tool\n' + '='.repeat(30));
  
  // Check if API key is present
  const apiKey = process.env.OPENAI_API_KEY;
  console.log(`API Key: ${maskApiKey(apiKey)}`);
  
  if (!apiKey) {
    console.error('❌ ERROR: OpenAI API key not found in environment variables');
    console.log('   Please set the OPENAI_API_KEY environment variable and try again.');
    process.exit(1);
  }
  
  // Get Assistant ID - use default if not specified
  const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
  console.log(`Assistant ID: ${assistantId}`);
  
  try {
    // Create OpenAI client
    const openai = new OpenAI({ apiKey });
    
    // Test basic API connectivity
    console.log('\nTesting API connectivity...');
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, are you working?" }],
        max_tokens: 10
      });
      
      console.log(`✅ API Connection Successful: "${completion.choices[0].message.content}"`);
    } catch (error: any) {
      console.error(`❌ API Connection Failed: ${error.message}`);
      console.error(error);
      process.exit(1);
    }
    
    // Test Assistant API
    console.log('\nTesting Assistant API...');
    try {
      const assistant = await openai.beta.assistants.retrieve(assistantId);
      console.log(`✅ Assistant Found: "${assistant.name}", Model: ${assistant.model}`);
    } catch (error: any) {
      console.error(`❌ Assistant Not Found: ${error.message}`);
      
      // If assistant is not found, try to list all assistants
      try {
        console.log('\nListing available assistants:');
        const assistants = await openai.beta.assistants.list({
          limit: 10,
        });
        
        if (assistants.data.length > 0) {
          console.log('Available assistants:');
          assistants.data.forEach((a, i) => {
            console.log(`${i+1}. ID: ${a.id}, Name: ${a.name}, Model: ${a.model}`);
          });
          console.log(`\n⚠️ Set OPENAI_ASSISTANT_ID to one of these values in your .env file.`);
        } else {
          console.log('No assistants found in your account');
        }
      } catch (listError: any) {
        console.error(`Error listing assistants: ${listError.message}`);
      }
      
      process.exit(1);
    }
    
    console.log('\n✅ OpenAI API verification completed successfully');
  } catch (error: any) {
    console.error(`\n❌ Verification failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the verification
verifyOpenAI().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
