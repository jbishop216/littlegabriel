/**
 * Startup script for deployment environments
 * 
 * This script ensures all environment variables are properly set
 * before starting the Next.js application.
 */

const { execSync } = require('child_process');

// Make environment variables available
require('dotenv').config({ path: '.env.production' });

// Ensure critical variables are available
process.env.OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
process.env.NODE_ENV = 'production';

console.log('Starting application with environment variables:');
console.log('OPENAI_ASSISTANT_ID:', process.env.OPENAI_ASSISTANT_ID);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Start the application
try {
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
}
