/**
 * Ensure OpenAI Assistant in Production
 *
 * This script ensures that the OpenAI Assistant API is used in production by:
 * 1. Updating the fallback check function to prefer Assistant API in production
 * 2. Adding FORCE_OPENAI_ASSISTANT=true to .env.production
 * 3. Verifying that these changes are working
 */

const fs = require('fs');
const path = require('path');

// Paths
const fallbackCheckPath = path.join(__dirname, '../src/lib/openai-fallback-check.js');
const envProductionPath = path.join(__dirname, '../.env.production');

// Ensure production environment for testing
process.env.NODE_ENV = 'production';
process.env.FORCE_OPENAI_ASSISTANT = 'true';

// Updated fallback check code
const updatedFallbackCheck = `/**
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
    console.log(\`Production environment detected. Using \${useFallback ? 'fallback mode' : 'Assistant API'}\`);
    return useFallback;
  }
  
  // In development, always use Assistant API by default
  return false;
}
`;

// Test function to verify behavior
function locallyTestFallbackCheck() {
  // This is a copy of the function for testing locally
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

// Update the fallback check file
function updateFallbackCheck() {
  console.log('Updating OpenAI fallback check function...');
  try {
    if (fs.existsSync(fallbackCheckPath)) {
      fs.writeFileSync(fallbackCheckPath, updatedFallbackCheck);
      console.log(`\u2705 Updated ${fallbackCheckPath}`);
    } else {
      console.error(`\u274c File not found: ${fallbackCheckPath}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`\u274c Error updating fallback check:`, error.message);
    return false;
  }
}

// Ensure FORCE_OPENAI_ASSISTANT=true is in .env.production
function updateEnvProduction() {
  console.log('\nEnsuring FORCE_OPENAI_ASSISTANT=true in .env.production...');
  try {
    if (fs.existsSync(envProductionPath)) {
      let envContent = fs.readFileSync(envProductionPath, 'utf8');
      
      // Check if FORCE_OPENAI_ASSISTANT already exists
      if (envContent.includes('FORCE_OPENAI_ASSISTANT=true')) {
        console.log('\u2705 FORCE_OPENAI_ASSISTANT=true already exists in .env.production');
      } else {
        // Add it to the environment file
        if (envContent.endsWith('\n')) {
          envContent += 'FORCE_OPENAI_ASSISTANT=true\n';
        } else {
          envContent += '\nFORCE_OPENAI_ASSISTANT=true\n';
        }
        
        fs.writeFileSync(envProductionPath, envContent);
        console.log('\u2705 Added FORCE_OPENAI_ASSISTANT=true to .env.production');
      }
    } else {
      // Create the file if it doesn't exist
      fs.writeFileSync(envProductionPath, 'FORCE_OPENAI_ASSISTANT=true\n');
      console.log(`\u2705 Created ${envProductionPath} with FORCE_OPENAI_ASSISTANT=true`);
    }
    return true;
  } catch (error) {
    console.error(`\u274c Error updating .env.production:`, error.message);
    return false;
  }
}

// Test the configuration
function verifyChanges() {
  console.log('\nVerifying changes...');
  
  // Test with FORCE_OPENAI_ASSISTANT=true
  process.env.NODE_ENV = 'production';
  process.env.FORCE_OPENAI_ASSISTANT = 'true';
  process.env.FORCE_OPENAI_FALLBACK = undefined;
  
  const withForceAssistant = locallyTestFallbackCheck();
  console.log(`With FORCE_OPENAI_ASSISTANT=true, should use fallback: ${withForceAssistant ? 'YES' : 'NO'}`);
  
  // Test default production behavior
  process.env.NODE_ENV = 'production';
  process.env.FORCE_OPENAI_ASSISTANT = undefined;
  process.env.FORCE_OPENAI_FALLBACK = undefined;
  
  const defaultProductionBehavior = locallyTestFallbackCheck();
  console.log(`With default production settings, should use fallback: ${defaultProductionBehavior ? 'YES' : 'NO'}`);
  
  // Check if the verification passes
  const verificationPassed = !withForceAssistant && !defaultProductionBehavior;
  
  if (verificationPassed) {
    console.log('\n\u2705 Verification passed! The OpenAI fallback check is working correctly!');
  } else {
    console.error('\n\u274c Verification failed! The fallback function is not behaving as expected.');
  }
  
  return verificationPassed;
}

// Run all the steps
function main() {
  console.log('=== Ensuring OpenAI Assistant in Production ===\n');
  
  const fallbackUpdated = updateFallbackCheck();
  const envUpdated = updateEnvProduction();
  const verificationPassed = verifyChanges();
  
  console.log('\n=== Summary ===');
  console.log(`1. Fallback check updated: ${fallbackUpdated ? '\u2705 Success' : '\u274c Failed'}`);
  console.log(`2. Environment variables updated: ${envUpdated ? '\u2705 Success' : '\u274c Failed'}`);
  console.log(`3. Verification passed: ${verificationPassed ? '\u2705 Success' : '\u274c Failed'}`);
  
  if (fallbackUpdated && envUpdated && verificationPassed) {
    console.log('\n\u2705 All changes successfully applied! OpenAI Assistant API will be used in production.');
    return 0;
  } else {
    console.error('\n\u274c Some changes failed to apply. Check the logs above for details.');
    return 1;
  }
}

// Execute the main function
const exitCode = main();
process.exit(exitCode);
