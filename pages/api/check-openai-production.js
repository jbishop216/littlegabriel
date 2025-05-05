/**
 * Basic OpenAI connectivity check optimized for production
 * This is a simplified version that only checks if the OpenAI API is accessible
 */

export default async function handler(req, res) {
  try {
    // For security, only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    // Using CommonJS require for maximum reliability
    const OpenAI = require('openai');

    // Get API key directly from process.env (most reliable source)
    const apiKey = process.env.OPENAI_API_KEY;
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    
    if (!apiKey) {
      return res.status(500).json({
        status: 'error',
        message: 'OPENAI_API_KEY environment variable is not set',
        env: {
          NODE_ENV: process.env.NODE_ENV,
          apiKeyPresent: !!apiKey,
          assistantId: assistantId
        }
      });
    }

    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: apiKey,
      maxRetries: 2,
      timeout: 30000
    });
    
    // Test basic chat completion
    console.log('Testing basic chat completion...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello!' }],
      max_tokens: 20
    });

    // Return success
    return res.status(200).json({
      status: 'success',
      message: 'OpenAI API is accessible',
      content: completion.choices[0].message.content,
      model: completion.model,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        apiKeyPresent: !!apiKey,
        apiKeyLength: apiKey.length,
        assistantId: assistantId
      }
    });
  } catch (error) {
    // Handle errors
    console.error('OpenAI connectivity test failed:', error);

    // Return detailed error for diagnostics
    return res.status(500).json({
      status: 'error',
      message: error.message,
      code: error.code,
      type: error.constructor.name,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        apiKeyPresent: !!process.env.OPENAI_API_KEY,
        apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
        assistantId: process.env.OPENAI_ASSISTANT_ID || 'not set'
      }
    });
  }
}