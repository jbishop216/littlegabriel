/**
 * Fix OpenAI Fallback Check Script
 * 
 * This script updates lib/openai-fallback-check.js to respect the FORCE_OPENAI_ASSISTANT
 * environment variable in production environments.
 */

const fs = require('fs');
const path = require('path');

// Path to the fallback check file
const fallbackCheckPath = path.resolve(process.cwd(), 'src/lib/openai-fallback-check.js');

// Check if the file exists
if (!fs.existsSync(fallbackCheckPath)) {
  console.error(`File not found: ${fallbackCheckPath}`);
  process.exit(1);
}

// Read the current content
let content = fs.readFileSync(fallbackCheckPath, 'utf8');

// Updated implementation that respects FORCE_OPENAI_ASSISTANT
const updatedImplementation = `/**
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
  
  // In production, check if we should enable Assistant API
  if (process.env.NODE_ENV === 'production') {
    // Default to fallback in production unless specifically configured otherwise
    const useAssistant = process.env.FORCE_OPENAI_ASSISTANT === 'true';
    console.log(\`Production environment detected. Using \${useAssistant ? 'Assistant API' : 'fallback mode'}\`);
    return !useAssistant;
  }
  
  // In development, always use Assistant API by default
  return false;
}
`;

// Write the updated content
fs.writeFileSync(fallbackCheckPath, updatedImplementation, 'utf8');

console.log(`Updated ${fallbackCheckPath} to respect FORCE_OPENAI_ASSISTANT environment variable`);
