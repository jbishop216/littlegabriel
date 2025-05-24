/**
 * Production Build Script
 * 
 * This script handles the production build process with proper environment
 * variable setup and error handling.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Run a command and print its output
 * @param {string} command The command to run
 * @returns {Buffer} The command output
 */
function runCommand(command) {
  console.log(`\nRunning command: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`\n❌ Command failed: ${command}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Main function to build the production application
 */
async function buildProduction() {
  console.log('\nProduction Build Script');
  console.log('======================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    // Step 1: Fix deployment environment variables
    console.log('\n🔧 Fixing deployment environment variables...');
    runCommand('node scripts/fix-deployment-env.js');
    
    // Step 2: Verify OpenAI API connectivity
    console.log('\n🔧 Verifying OpenAI API connectivity...');
    try {
      runCommand('npx ts-node --compiler-options \'{"module":"CommonJS"}\' scripts/verify-openai-api.ts');
    } catch (apiError) {
      console.warn('⚠️ OpenAI API verification failed. Build will continue, but the app may not function correctly.');
    }
    
    // Step 3: Run the Next.js build
    console.log('\n🏗️ Running Next.js production build...');
    runCommand('NODE_ENV=production next build');
    
    console.log('\n✅ Production build completed successfully!');
  } catch (error) {
    console.error('\n❌ Production build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
buildProduction().catch(err => {
  console.error('Fatal error during production build:', err);
  process.exit(1);
});
