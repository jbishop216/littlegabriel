/**
 * Simple script to check which OpenAI API key is being used at runtime
 */

const apiKey = process.env.OPENAI_API_KEY || 'Not Set';

console.log('Environment:', process.env.NODE_ENV || 'Not Set');
console.log('API Key First 10 Chars:', apiKey.substring(0, 10) + '...');
console.log('API Key Last 4 Chars:', apiKey.substring(apiKey.length - 4));
console.log('API Key Length:', apiKey.length);

// Check for Assistant ID too
console.log('OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID || 'Not Set');
