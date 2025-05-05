/**
 * Test for OpenAI fallback check function
 */

import { shouldUseFallback } from './src/lib/openai-fallback-check.js';

// Test different environment combinations
function testFallbackFunction() {
  // Save original environment
  const originalEnv = { ...process.env };

  // Test 1: Production with FORCE_OPENAI_ASSISTANT=true
  process.env.NODE_ENV = 'production';
  process.env.FORCE_OPENAI_ASSISTANT = 'true';
  process.env.FORCE_OPENAI_FALLBACK = undefined;
  console.log('Test 1: Production + FORCE_OPENAI_ASSISTANT=true');
  console.log('Result:', shouldUseFallback());
  console.log('Expected: false\n');

  // Test 2: Production with no flags
  process.env.NODE_ENV = 'production';
  process.env.FORCE_OPENAI_ASSISTANT = undefined;
  process.env.FORCE_OPENAI_FALLBACK = undefined;
  console.log('Test 2: Production with no flags');
  console.log('Result:', shouldUseFallback());
  console.log('Expected: false\n');

  // Test 3: Production with FORCE_OPENAI_FALLBACK=true
  process.env.NODE_ENV = 'production';
  process.env.FORCE_OPENAI_ASSISTANT = undefined;
  process.env.FORCE_OPENAI_FALLBACK = 'true';
  console.log('Test 3: Production + FORCE_OPENAI_FALLBACK=true');
  console.log('Result:', shouldUseFallback());
  console.log('Expected: true\n');

  // Test 4: Development with no flags
  process.env.NODE_ENV = 'development';
  process.env.FORCE_OPENAI_ASSISTANT = undefined;
  process.env.FORCE_OPENAI_FALLBACK = undefined;
  console.log('Test 4: Development with no flags');
  console.log('Result:', shouldUseFallback());
  console.log('Expected: false\n');

  // Restore original environment
  process.env = originalEnv;
}

testFallbackFunction();
