import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/openai';
import { ENV } from '@/lib/env';
import { shouldUseFallback } from '@/lib/openai-fallback-check';
import OpenAI from 'openai';

// Bible Chat Assistant ID - using the same Gabriel assistant 
// This assistant has been properly configured in OpenAI dashboard
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || ENV.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
console.log('Using Bible Chat Assistant ID:', ASSISTANT_ID);

// Check if we should immediately redirect to fallback based on environment
const USE_FALLBACK = shouldUseFallback();
if (USE_FALLBACK) {
  console.log('Bible Chat API: Using fallback mode based on environment check');
}

export async function POST(request: NextRequest) {
  try {
    // If we should use fallback mode, redirect to the fallback API endpoint
    if (USE_FALLBACK) {
      console.log('Bible Chat API: Redirecting to fallback endpoint');
      // Clone the request and forward it to the fallback endpoint
      const response = await fetch(new URL('/api/bible-chat-fallback', request.url), {
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
    // We don't require authentication for the Bible Chat feature
    // so all users can get Bible explanations without logging in
    const requestBody = await request.json();
    console.log('Bible chat request received:', { 
      hasMessages: !!requestBody?.messages, 
      messageCount: requestBody?.messages?.length || 0 
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
      // Create a thread for this Bible chat conversation
      const thread = await openai.beta.threads.create();
      console.log('Bible chat thread created:', thread.id);

      // Add the user's message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: lastMessage.content
      });
      console.log('Added Bible query to thread');

      // Run the assistant on the thread with Bible-specific focus
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
        instructions: "Focus exclusively on providing biblical insights, historical context, and scriptural explanation rather than personal counseling or therapy. Analyze the biblical text, explain meanings, provide historical background, clarify theological concepts, and give cross-references to other relevant passages. Prioritize scholarly biblical information over therapeutic or emotional support."
      });
      console.log('Started Bible assistant run:', run.id);

      // Poll for the completion of the run
      let completedRun = await pollRunCompletion(openai, thread.id, run.id);
      console.log('Bible run completed with status:', completedRun.status);

      if (completedRun.status !== 'completed') {
        throw new Error(`Bible chat run failed with status: ${completedRun.status}`);
      }

      // Get the assistant's message from the thread
      const threadMessages = await openai.beta.threads.messages.list(thread.id);
      console.log('Retrieved Bible chat messages from thread, count:', threadMessages.data.length);

      // Find the assistant's messages (should be the latest)
      const assistantMessages = threadMessages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      if (assistantMessages.length === 0) {
        throw new Error('No assistant messages found in Bible chat thread');
      }

      // Get the latest message
      const latestMessage = assistantMessages[0];
      console.log('Latest Bible assistant message found, id:', latestMessage.id);

      // Extract the content from the message
      let responseText = '';
      for (const content of latestMessage.content) {
        if (content.type === 'text') {
          responseText += content.text.value;
        }
      }
      console.log('Bible response text extracted, length:', responseText.length);

      // Return the response text directly
      return new Response(responseText);
    } catch (assistantError) {
      console.error('Error using Assistant API for Bible chat:', assistantError);
      
      // Check if this is a "no assistant found" error (common in production)
      const errorMessage = assistantError instanceof Error ? assistantError.message : String(assistantError);
      if (errorMessage.includes('No assistant found with id')) {
        console.log('Bible Chat: Detected missing assistant error, redirecting to fallback');
        // Redirect to the fallback endpoint
        const response = await fetch(new URL('/api/bible-chat-fallback', request.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: request.body
        });
        
        if (response.ok) {
          const text = await response.text();
          console.log('Bible Chat: Successfully used fallback after Assistant error');
          return new Response(text);
        }
      }
      
      throw assistantError; // re-throw to be caught by the outer try-catch if no fallback was possible
    }
    
  } catch (error: any) {
    console.error('Bible Chat API error:', error?.message || 'Unknown error', error?.stack || '');
    
    // If it's an OpenAI API error with more details
    if (error?.response?.data) {
      console.error('OpenAI API details:', error.response.data);
    }
    
    // Return a JSON error response instead of a streaming response when there's an error
    return NextResponse.json(
      { error: 'An error occurred while processing your Bible study request.' },
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