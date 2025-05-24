/**
 * Test the fallback detection mechanism
 */

// Import the module
const { shouldUseFallback, detectEnvironment } = require('./src/lib/openai-fallback-check');

// First test in development mode
console.log('=== Development Environment Test ===');
console.log('Fallback decision:', shouldUseFallback() ? 'Use Fallback' : 'Use Assistant');

// Now test with production environment
console.log('\n=== Production Environment Test ===');
process.env.NODE_ENV = 'production';
console.log('Fallback decision:', shouldUseFallback() ? 'Use Fallback' : 'Use Assistant');

// Test with force assistant
console.log('\n=== Force Assistant Test ===');
process.env.FORCE_OPENAI_ASSISTANT = 'true';
console.log('Fallback decision:', shouldUseFallback() ? 'Use Fallback' : 'Use Assistant');

// Reset and test with force fallback
process.env.FORCE_OPENAI_ASSISTANT = '';
process.env.FORCE_OPENAI_FALLBACK = 'true';
console.log('\n=== Force Fallback Test ===');
console.log('Fallback decision:', shouldUseFallback() ? 'Use Fallback' : 'Use Assistant');
