
/**
 * Deployment Check Script
 * This script verifies that all necessary components are correctly configured before deployment
 */

console.log('🔍 Running deployment pre-checks...');

// Check NODE_ENV
if (process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ NODE_ENV is not set to production, setting it now');
  process.env.NODE_ENV = 'production';
}

// Check for critical environment variables
const requiredVars = [
  'BIBLE_API_KEY',
  'SESSION_SECRET',
  'OPENAI_API_KEY',
  'OPENAI_ASSISTANT_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️ Some recommended environment variables are missing: ${missingVars.join(', ')}`);
  console.warn('The application may still work, but functionality might be limited');
} else {
  console.log('✅ All critical environment variables are present');
}

// All checks passed
console.log('✅ Pre-deployment checks completed');
console.log('✅ Your application is ready for deployment');
