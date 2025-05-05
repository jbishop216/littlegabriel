/**
 * Comprehensive OpenAI Debug and Diagnostic API
 * 
 * This endpoint tests different methods of initializing and using the OpenAI client
 * to help isolate where the production issues might be occurring.
 */

export default async function handler(req, res) {
  // For security, only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 4)}...` : 'not set',
      OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
      OPENAI_ASSISTANT_ID: process.env.OPENAI_ASSISTANT_ID || 'not set',
      ASSISTANT_ID: process.env.ASSISTANT_ID || 'not set',
    },
    tests: {}
  };

  try {
    // Test 1: Direct require of OpenAI
    try {
      const OpenAI = require('openai');
      results.tests.require = { status: 'success', message: 'OpenAI package loaded successfully' };
      
      // Test 2: Create client using direct API key reference
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          results.tests.client_creation = { 
            status: 'failed', 
            message: 'Missing OpenAI API key' 
          };
        } else {
          const client = new OpenAI({ apiKey });
          results.tests.client_creation = { 
            status: 'success', 
            message: 'Client created successfully' 
          };
          
          // Test 3: Simple completion request
          try {
            const completion = await client.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'Hello, this is a test.' }],
              max_tokens: 20,
            });
            
            results.tests.completion = {
              status: 'success',
              message: 'Chat completion successful',
              content: completion.choices[0].message.content,
              model: completion.model
            };
          } catch (completionError) {
            results.tests.completion = {
              status: 'failed',
              message: `Chat completion failed: ${completionError.message}`,
              error: completionError.message,
              type: completionError.constructor.name
            };
          }
          
          // Test 4: Assistant API
          try {
            const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID;
            if (!assistantId) {
              results.tests.assistant = {
                status: 'skipped',
                message: 'No assistant ID found'
              };
            } else {
              const assistant = await client.beta.assistants.retrieve(assistantId);
              results.tests.assistant = {
                status: 'success',
                message: 'Assistant retrieved successfully',
                name: assistant.name,
                model: assistant.model,
                created: new Date(assistant.created_at * 1000).toISOString()
              };
            }
          } catch (assistantError) {
            results.tests.assistant = {
              status: 'failed',
              message: `Assistant retrieval failed: ${assistantError.message}`,
              error: assistantError.message,
              type: assistantError.constructor.name
            };
          }
        }
      } catch (clientError) {
        results.tests.client_creation = { 
          status: 'failed', 
          message: `Failed to create client: ${clientError.message}`,
          error: clientError.message,
          type: clientError.constructor.name
        };
      }
    } catch (requireError) {
      results.tests.require = { 
        status: 'failed', 
        message: `OpenAI package require failed: ${requireError.message}`,
        error: requireError.message,
        type: requireError.constructor.name
      };
    }
    
    // Test 5: Import from @/lib/openai (our custom module)
    try {
      // Use dynamic import which is safer in Next.js
      const { createClient } = await import('../../src/lib/openai');
      results.tests.import_lib = { status: 'success', message: 'Successfully imported @/lib/openai' };
      
      // Test using our custom client
      try {
        const client = createClient();
        results.tests.lib_client = { status: 'success', message: 'Successfully created client using our library' };
        
        // Only run if we haven't already done a completion test
        if (!results.tests.completion || results.tests.completion.status !== 'success') {
          try {
            const completion = await client.chat.completions.create({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: 'Hello from lib client.' }],
              max_tokens: 20,
            });
            
            results.tests.lib_completion = {
              status: 'success',
              message: 'Chat completion using lib client successful',
              content: completion.choices[0].message.content,
              model: completion.model
            };
          } catch (libCompletionError) {
            results.tests.lib_completion = {
              status: 'failed',
              message: `Chat completion using lib client failed: ${libCompletionError.message}`,
              error: libCompletionError.message,
              type: libCompletionError.constructor.name
            };
          }
        }
      } catch (libClientError) {
        results.tests.lib_client = { 
          status: 'failed', 
          message: `Failed to create client using our library: ${libClientError.message}`,
          error: libClientError.message,
          type: libClientError.constructor.name
        };
      }
    } catch (importError) {
      results.tests.import_lib = { 
        status: 'failed', 
        message: `Failed to import @/lib/openai: ${importError.message}`,
        error: importError.message,
        type: importError.constructor.name
      };
    }
    
    // Add recommendations based on test results
    results.recommendations = [];
    
    // Check for missing API key
    if (!process.env.OPENAI_API_KEY) {
      results.recommendations.push('CRITICAL: OPENAI_API_KEY environment variable is not set. Set this in your deployment environment.');
    }
    
    // Check for API key but failed completion
    if (process.env.OPENAI_API_KEY && results.tests.completion?.status === 'failed') {
      results.recommendations.push('API key is present but completions failed. This could indicate an invalid key or network issue.');
    }
    
    // Check for missing assistant ID
    if (!process.env.OPENAI_ASSISTANT_ID && !process.env.ASSISTANT_ID) {
      results.recommendations.push('WARNING: No assistant ID found in environment variables. Set OPENAI_ASSISTANT_ID in your deployment.');
    }
    
    // Check for library import issues
    if (results.tests.import_lib?.status === 'failed') {
      results.recommendations.push('Library import failed. This suggests a build issue with how @/lib/openai is being bundled.');
    }
    
    // Summary
    const hasErrors = Object.values(results.tests).some(test => test.status === 'failed');
    results.summary = hasErrors 
      ? 'Some OpenAI integration tests failed. See recommendations for fixes.'
      : 'All OpenAI integration tests passed successfully!';
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Diagnostic endpoint failed:', error);
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      message: `Diagnostic endpoint failed: ${error.message}`,
      error: error.message,
      type: error.constructor.name,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
}