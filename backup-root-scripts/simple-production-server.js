// Simple Production Server for testing OpenAI Assistant
// This creates a minimal Express server to test the OpenAI Assistant in production mode

const express = require('express');
const { OpenAI } = require('openai');

// Force production mode
process.env.NODE_ENV = 'production';

// Ensure we use our OpenAI Assistant
process.env.FORCE_OPENAI_ASSISTANT = 'true';

const server = express();
const port = process.env.PORT || 5001; // Use port 5001 for testing

// API endpoint to test the OpenAI Assistant connectivity
server.get('/api/test-openai-assistant', async (req, res) => {
  try {
    // Create OpenAI instance with the same settings as our production app
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
    console.log('Attempting to retrieve assistant:', assistantId);
    
    // Try to retrieve the assistant
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    
    // If successful, return success response
    res.json({
      success: true,
      message: 'Successfully connected to OpenAI Assistant API',
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        FORCE_OPENAI_ASSISTANT: process.env.FORCE_OPENAI_ASSISTANT
      }
    });
  } catch (error) {
    console.error('Error in OpenAI test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect to OpenAI Assistant',
      error: error.message
    });
  }
});

// Main route
server.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Gabriel - Bible AI Assistant (Production Test)</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #3b82f6; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .success { border-left: 4px solid #22c55e; }
        .warning { border-left: 4px solid #f59e0b; }
        button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        button:hover { background: #2563eb; }
        pre { background: #f1f5f9; padding: 10px; border-radius: 4px; overflow: auto; }
        .loading { display: none; }
      </style>
    </head>
    <body>
      <h1>Gabriel - Bible AI Assistant</h1>
      <p>This is a production test server for the Gabriel Bible AI assistant.</p>
      
      <div class="card">
        <h2>Environment Configuration</h2>
        <p><strong>NODE_ENV:</strong> ${process.env.NODE_ENV}</p>
        <p><strong>FORCE_OPENAI_ASSISTANT:</strong> ${process.env.FORCE_OPENAI_ASSISTANT}</p>
      </div>
      
      <div class="card">
        <h2>OpenAI Assistant Test</h2>
        <p>Click the button below to test the OpenAI Assistant connectivity:</p>
        <button id="testButton">Test OpenAI Assistant</button>
        <div id="loading" class="loading">Testing... please wait...</div>
        <div id="result"></div>
      </div>
      
      <script>
        document.getElementById('testButton').addEventListener('click', async function() {
          const resultDiv = document.getElementById('result');
          const loadingDiv = document.getElementById('loading');
          
          resultDiv.innerHTML = '';
          loadingDiv.style.display = 'block';
          
          try {
            const response = await fetch('/api/test-openai-assistant');
            const data = await response.json();
            
            loadingDiv.style.display = 'none';
            
            if (data.success) {
              resultDiv.innerHTML = '<div class="card success"><h3>✅ Success!</h3><p>' + 
                data.message + '</p><h4>Assistant Details:</h4><pre>' + 
                JSON.stringify(data.assistant, null, 2) + 
                '</pre><h4>Environment:</h4><pre>' + 
                JSON.stringify(data.environment, null, 2) + '</pre></div>';
            } else {
              resultDiv.innerHTML = '<div class="card warning"><h3>⚠️ Error</h3><p>' + 
                data.message + '</p><pre>' + data.error + '</pre></div>';
            }
          } catch (error) {
            loadingDiv.style.display = 'none';
            resultDiv.innerHTML = '<div class="card warning"><h3>⚠️ Error</h3>' + 
              '<p>Failed to test OpenAI Assistant</p><pre>' + 
              error.message + '</pre></div>';
          }
        });
      </script>
    </body>
  </html>
  `;
  
  res.send(html);
});

// Start the server
server.listen(port, '0.0.0.0', (err) => {
  if (err) throw err;
  console.log(`✅ Production test server running on http://localhost:${port}`);
  console.log('OpenAI Assistant enabled:', process.env.FORCE_OPENAI_ASSISTANT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
});