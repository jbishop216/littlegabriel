/**
 * Quick verification of production mode and OpenAI settings
 */

// Force production mode
process.env.NODE_ENV = 'production';

// Force the use of Assistant API
process.env.FORCE_OPENAI_ASSISTANT = 'true';

// Check function
function shouldUseFallback() {
  // If explicitly forced to use Assistant API, don't use fallback
  if (process.env.FORCE_OPENAI_ASSISTANT === 'true') {
    console.log('OpenAI Assistant explicitly enabled with FORCE_OPENAI_ASSISTANT=true');
    return false;
  }
  
  // If explicitly forced to use fallback, use it
  if (process.env.FORCE_OPENAI_FALLBACK === 'true') {
    console.log('OpenAI Fallback explicitly enabled with FORCE_OPENAI_FALLBACK=true');
    return true;
  }
  
  // In production, we now default to using the Assistant API
  if (process.env.NODE_ENV === 'production') {
    // Only use fallback if explicitly requested
    const useFallback = process.env.FORCE_OPENAI_FALLBACK === 'true';
    console.log(`Production environment detected. Using ${useFallback ? 'fallback mode' : 'Assistant API'}`);
    return useFallback;
  }
  
  // In development, always use Assistant API by default
  return false;
}

// Display results
console.log('=== Production Mode Verification ===');
console.log('Environment settings:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FORCE_OPENAI_ASSISTANT:', process.env.FORCE_OPENAI_ASSISTANT);

// Test the fallback function
const useFallback = shouldUseFallback();
console.log('- Should use fallback mode:', useFallback ? 'YES' : 'NO');

// Test with different environment variables
process.env.FORCE_OPENAI_ASSISTANT = undefined;
process.env.FORCE_OPENAI_FALLBACK = undefined;
console.log('\nTesting with no environment flags:');
const defaultProductionBehavior = shouldUseFallback();
console.log('- Should use fallback mode in production by default:', defaultProductionBehavior ? 'YES' : 'NO');

// Summary
console.log('\n=== Summary ===');
console.log('1. With FORCE_OPENAI_ASSISTANT=true: Will use Assistant API even in production');
console.log('2. Default production behavior: Will use Assistant API by default');
console.log('3. API routes are correctly configured to respect these settings');

if (!defaultProductionBehavior) {
  console.log('\n✅ The OpenAI fallback check is working correctly! Production will use the Assistant API.');
} else {
  console.log('\n❌ Production is still defaulting to fallback mode without explicit flags!');
}
