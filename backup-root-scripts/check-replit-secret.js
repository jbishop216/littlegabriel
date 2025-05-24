/**
 * This script checks what's in the Replit secrets directly
 */

const { execSync } = require('child_process');

try {
  // This accesses the secret directly from the Replit environment
  const output = execSync('echo $REPLIT_OPENAI_API_KEY').toString().trim();
  
  if (output) {
    console.log('Found Replit secret OPENAI_API_KEY');
    console.log('First 10 chars:', output.substring(0, 10) + '...');
    console.log('Last 4 chars:', output.substring(output.length - 4));
    console.log('Length:', output.length);
  } else {
    console.log('No Replit secret found for OPENAI_API_KEY');
  }
} catch (error) {
  console.error('Error accessing Replit secret:', error.message);
}
