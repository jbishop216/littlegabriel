import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/openai';
import { ENV } from '@/lib/env';
import { shouldUseFallback } from '@/lib/openai-fallback-check';
import OpenAI from 'openai';

// Bible Chat Assistant ID - using the same Gabriel assistant 
// This assistant has been properly configured in OpenAI dashboard
// Make sure we're using the latest GPT-4o assistant ID
// Get the Assistant ID from environment variables to match the chat API
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || ENV.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
console.log('Using Bible Chat Assistant ID:', ASSISTANT_ID, '(from environment variables)');
console.log('Bible Chat API environment mode:', ENV.NODE_ENV);

// Force using the assistant API for Bible chat
const USE_FALLBACK = false; // Override the fallback check to always use the assistant
console.log('Bible Chat API: Forcing use of Assistant API');

export async function POST(request: NextRequest) {
  try {
    // If we should use fallback mode, redirect to the fallback API endpoint
    if (USE_FALLBACK) {
      console.log('Bible Chat API: Redirecting to fallback endpoint');
      // Clone the request and forward it to the fallback endpoint
      // Safe URL construction with fallback for build-time
      let fallbackUrl;
      try {
        fallbackUrl = new URL('/api/bible-chat-fallback', request.url);
      } catch (e) {
        // During build/SSG, request.url might not be a valid URL
        // Use absolute URL as fallback
        fallbackUrl = new URL('/api/bible-chat-fallback', 'https://example.com');
      }
      const response = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: request.body
      });
      
      // Return the response directly
      if (response.ok) {
        const text = await response.text();
        console.log('Bible Chat API: Fallback responded successfully');
        return new Response(text);
      } else {
        const errorData = await response.json();
        console.error('Bible Chat API: Fallback endpoint error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    }
    
    // Otherwise continue with the normal Assistant-based implementation
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const userEmail = request.headers.get('x-user-email');
    
    // Get cookies for session-based auth
    const cookies = request.cookies;
    const sessionToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value;
    
    // Log authentication attempt
    console.log('Bible chat auth check:', { 
      hasAuthHeader: !!authHeader,
      hasUserEmail: !!userEmail,
      hasSessionToken: !!sessionToken
    });
    
    // Parse the request body
    const requestBody = await request.json();
    console.log('Bible chat request received:', { 
      hasMessages: !!requestBody?.messages, 
      messageCount: requestBody?.messages?.length || 0,
      userEmail: requestBody?.userEmail || userEmail
    });
    
    const { messages } = requestBody;
    
    if (!messages || !Array.isArray(messages)) {
      console.error('Bible Chat API error: Invalid request - messages array missing or not an array');
      return NextResponse.json({ error: 'Invalid request. Messages array is required.' }, { status: 400 });
    }
    
    // Initialize the OpenAI client
    const openai = createClient();
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    console.log('Sending to OpenAI:', {
      messageCount: messages.length,
      lastUserMessage: lastMessage.content
    });
    
    // Using the Assistant API approach
    try {
      console.log('Bible Chat API: Attempting to use Assistant API with ID:', ASSISTANT_ID);
      
      // Use a fallback assistant ID if the configured one isn't working
      const assistantId = ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
      console.log('Bible Chat API: Using assistant ID:', assistantId);
      
      try {
        // This will throw an error if the assistant doesn't exist or the API key doesn't have permission
        const assistantCheck = await openai.beta.assistants.retrieve(assistantId);
        console.log('Bible Chat API: Successfully retrieved assistant:', assistantCheck.id);
      } catch (error: any) {
        console.error('Bible Chat API: Failed to retrieve assistant:', error);
        // If we can't retrieve the assistant, return a clear error message
        const errorMessage = error?.message || 'Unknown error accessing assistant';
        return NextResponse.json({
          error: 'Assistant Access Error',
          message: `Cannot access assistant: ${errorMessage}. Please check your API key permissions for Assistants.`
        }, { status: 500 });
      }
      
      // Create a thread for this conversation
      console.log('Bible Chat API: Creating new thread');
      const thread = await openai.beta.threads.create();
      console.log('Bible Chat API: Thread created:', thread.id);

      // Add all messages to the thread to preserve conversation context
      console.log('Bible Chat API: Adding messages to thread, count:', messages.length);
      for (const message of messages) {
        // Skip system messages as they're handled by the assistant configuration
        if (message.role === 'system') continue;
        
        console.log('Bible Chat API: Adding message with role:', message.role);
        await openai.beta.threads.messages.create(thread.id, {
          role: message.role as 'user' | 'assistant',
          content: message.content
        });
      }
      console.log('Bible Chat API: All messages added to thread');

      // Run the assistant on the thread - use the assistant's built-in configuration
      console.log('Bible Chat API: Starting assistant run with assistant ID:', assistantId);
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
        // No custom instructions - use the assistant's built-in configuration
      });
      console.log('Started Bible assistant run:', run.id);

      // Poll for the completion of the run
      let completedRun = await pollRunCompletion(openai, thread.id, run.id);
      console.log('Bible run completed with status:', completedRun.status);

      if (completedRun.status !== 'completed') {
        throw new Error(`Bible chat run failed with status: ${completedRun.status}`);
      }

      // Get the assistant's message from the thread
      console.log('Bible Chat API: Retrieving messages from thread');
      const threadMessages = await openai.beta.threads.messages.list(thread.id);
      console.log('Bible Chat API: Retrieved messages from thread, count:', threadMessages.data.length);

      // Find the assistant's messages (should be the latest)
      const assistantMessages = threadMessages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      console.log('Bible Chat API: Found assistant messages', { count: assistantMessages.length });

      if (assistantMessages.length === 0) {
        console.error('Bible Chat API: No assistant messages found in thread');
        throw new Error('No assistant messages found in thread');
      }

      // Get the latest message
      const latestMessage = assistantMessages[0];
      console.log('Bible Chat API: Latest assistant message found, id:', latestMessage.id);

      // Extract the content from the message
      let responseText = '';
      for (const content of latestMessage.content) {
        if (content.type === 'text') {
          responseText += content.text.value;
        }
      }
      console.log('Bible Chat API: Response text extracted', { 
        length: responseText.length,
        preview: responseText.substring(0, 50) + '...'
      });

      // Return the response text directly
      return new Response(responseText);
    } catch (assistantError) {
      console.error('Error using Assistant API for Bible chat:', assistantError);
      
      // Log detailed error information for debugging
      if (assistantError instanceof Error) {
        console.error('Bible Chat API: Error details:', {
          name: assistantError.name,
          message: assistantError.message,
          stack: assistantError.stack
        });
      }
      
      // Instead of falling back, return a clear error message
      // This will help us debug the issue rather than masking it with a fallback
      return NextResponse.json({
        error: 'Error using OpenAI Assistant API',
        message: 'There was an error using the OpenAI Assistant API. Please check your API key permissions and assistant configuration.',
        details: assistantError instanceof Error ? assistantError.message : String(assistantError)
      }, { status: 500 });
      
      // Note: We're not using fallback anymore as requested by the user
    }
    
  } catch (error: any) {
    console.error('Bible Chat API error:', error?.message || 'Unknown error', error?.stack || '');
    
    // If it's an OpenAI API error with more details
    if (error?.response?.data) {
      console.error('OpenAI API details:', error.response.data);
    }
    
    // If the error is related to API permissions, provide a more helpful message
    const errorMessage = error?.message || '';
    if (errorMessage.includes('API key') || errorMessage.includes('permission') || errorMessage.includes('Cannot access assistant')) {
      console.log('Bible Chat API: Detected API key permission issue');
      console.error('API Key permission error details:', {
        error: errorMessage,
        assistantId: ASSISTANT_ID
      });
      
      // Return a helpful error message for API key permission issues
      return NextResponse.json({
        error: 'OpenAI API key permission issue detected',
        message: 'Your API key needs permissions for Assistants and Threads. Please check your OpenAI dashboard.',
        details: errorMessage
      }, { status: 403 });
    }
    
    // Return a JSON error response instead of a streaming response when there's an error
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your Bible study request.',
        details: error?.message || 'Unknown error',
        apiKeyIssue: errorMessage.includes('API key') || errorMessage.includes('permission')
      },
      { status: 500 }
    );
  }
}

// Helper function to poll for run completion
async function pollRunCompletion(openai: OpenAI, threadId: string, runId: string) {
  console.log('Polling for Bible chat run completion...');
  
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);
  console.log('Initial Bible run status:', run.status);
  
  // Define terminal states where polling should stop
  const terminalStates = ['completed', 'failed', 'cancelled', 'expired'];
  
  // Poll until we reach a terminal state
  while (!terminalStates.includes(run.status)) {
    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the updated run status
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log('Updated Bible run status:', run.status);
  }
  
  return run;
}