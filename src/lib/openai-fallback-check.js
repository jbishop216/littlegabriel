/**
 * OpenAI API Fallback Check
 * 
 * This module determines whether the app should use the OpenAI Assistant API
 * or fall back to a different implementation based on the environment and
 * configuration.
 */

/**
 * Check if the application should use fallback mode instead of OpenAI Assistant API
 * 
 * @returns {boolean} True if fallback mode should be used, false otherwise
 */
export function shouldUseFallback() {
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
  // This change fixes the previous behavior where production defaulted to fallback
  if (process.env.NODE_ENV === 'production') {
    // Only use fallback if explicitly requested
    const useFallback = process.env.FORCE_OPENAI_FALLBACK === 'true';
    console.log(`Production environment detected. Using ${useFallback ? 'fallback mode' : 'Assistant API'}`);
    return useFallback;
  }
  
  // In development, always use Assistant API by default
  return false;
}
