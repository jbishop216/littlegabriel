import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@/lib/openai';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OpenAI } from 'openai';

// Define proper types for messages
type Role = 'user' | 'assistant' | 'system';
type Message = {
  role: Role;
  content: string;
};

// Import from our centralized environment configuration
import { ENV } from '@/lib/env';
import { shouldUseFallback } from '@/lib/openai-fallback-check';

// Get the Assistant ID from our environment module which has proper fallbacks
const ASSISTANT_ID = ENV.OPENAI_ASSISTANT_ID;
                    
console.log('Using OpenAI Assistant ID:', ASSISTANT_ID);
console.log('Environment mode:', ENV.NODE_ENV);

// Check if we should immediately redirect to fallback
const USE_FALLBACK = shouldUseFallback();
if (USE_FALLBACK) {
  console.log('Chat API: Using fallback mode based on environment check');
}

export async function POST(req: NextRequest) {
  try {
    // If we should use fallback mode, redirect to the fallback API endpoint
    if (USE_FALLBACK) {
      console.log('Chat API: Redirecting to fallback endpoint');
      // Clone the request and forward it to the fallback endpoint
      const response = await fetch(new URL('/api/chat-fallback', req.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: req.body
      });
      
      // Return the response directly
      if (response.ok) {
        const text = await response.text();
        console.log('Chat API: Fallback responded successfully');
        return new Response(text);
      } else {
        const errorData = await response.json();
        console.error('Chat API: Fallback endpoint error:', errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
    }
      
    // Otherwise continue with the normal Assistant-based implementation
    const session = await getServerSession(authOptions);
    
    // Parse the request body to check for direct authentication
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Chat API: Failed to parse request body', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    // Check for direct authentication info in the request
    const authInfo = requestBody.auth;
    const cookies = req.cookies;
    const hasDirectAuthCookie = cookies.has('gabriel-auth-token');
    const hasSiteAuthCookie = cookies.has('gabriel-site-auth');
    
    // Initialize user information
    let userId = session?.user?.id || 'direct-auth-user';
    let userEmail = session?.user?.email || authInfo?.email || 'direct-auth-user@example.com';
    
    console.log('Chat API: Auth check', { 
      hasSession: !!session?.user,
      hasDirectAuthCookie,
      hasSiteAuthCookie,
      authInfoProvided: !!authInfo,
      userEmail
    });
    
    // If no NextAuth session, check for direct auth
    if (!session?.user) {
      if (hasDirectAuthCookie || hasSiteAuthCookie || authInfo?.hasDirectAuth) {
        console.log('Chat API: Using direct authentication', { userEmail });
      } else {
        console.log('Chat API: Unauthorized - No authentication found');
        return new Response('Unauthorized', { status: 401 });
      }
    } else {
      console.log('Chat API: Authenticated with NextAuth as user:', session.user.email);
    }
    
    const { messages } = requestBody;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('Chat API: Invalid messages array', { messagesProvided: !!messages, isArray: Array.isArray(messages), length: messages?.length });
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    console.log('Chat API: Received valid messages array', { messageCount: messages.length });

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY || ENV.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Chat API: Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please contact the administrator.' }, 
        { status: 503 }
      );
    }

    console.log('Chat API: OpenAI API key is available', { 
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 3),
      envMode: process.env.NODE_ENV || 'development'
    });

    const lastMessage = messages[messages.length - 1];

    console.log('Chat API: Processing user message', { 
      content: lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : ''),
      length: lastMessage.content.length
    });

    // Save the user's message to the database
    try {
      // Make sure userId is a string
      const userIdString = String(userId);
      await saveMessageToDb(userIdString, lastMessage.content, true);
      console.log('Chat API: User message saved to database');
    } catch (error) {
      console.log('Chat API: Error saving user message:', error);
      // Continue even if saving fails
    }

    // Get the OpenAI client
    console.log('Chat API: Creating OpenAI client');
    const openai = createClient();
    
    console.log('Chat API: Creating thread for assistant conversation');
    
    try {
      // Use a fallback assistant ID if the configured one isn't working
      const assistantId = ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';
      console.log('Chat API: Using assistant ID:', assistantId);
      
      // Create a thread for this conversation
      console.log('Chat API: Creating new thread');
      const thread = await openai.beta.threads.create();
      console.log('Chat API: Thread created:', thread.id);

      // Add the user's message to the thread
      console.log('Chat API: Adding user message to thread');
      await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: lastMessage.content
      });
      console.log('Chat API: Added user message to thread');

      // Run the assistant on the thread
      console.log('Chat API: Starting assistant run with assistant ID:', assistantId);
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistantId
      });
      console.log('Chat API: Started assistant run:', run.id);

      // Poll for the completion of the run
      console.log('Chat API: Polling for run completion');
      let completedRun = await pollRunCompletion(openai, thread.id, run.id);
      console.log('Chat API: Run completed with status:', completedRun.status);

      if (completedRun.status !== 'completed') {
        console.error(`Chat API: Run failed with status: ${completedRun.status}`);
        throw new Error(`Run failed with status: ${completedRun.status}`);
      }

      // Get the assistant's message from the thread
      console.log('Chat API: Retrieving messages from thread');
      const threadMessages = await openai.beta.threads.messages.list(thread.id);
      console.log('Chat API: Retrieved messages from thread, count:', threadMessages.data.length);

      // Find the assistant's messages (should be the latest)
      const assistantMessages = threadMessages.data
        .filter(msg => msg.role === 'assistant')
        .sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

      console.log('Chat API: Found assistant messages', { count: assistantMessages.length });

      if (assistantMessages.length === 0) {
        console.error('Chat API: No assistant messages found in thread');
        throw new Error('No assistant messages found in thread');
      }

      // Get the latest message
      const latestMessage = assistantMessages[0];
      console.log('Chat API: Latest assistant message found, id:', latestMessage.id);

      // Extract the content from the message
      let responseText = '';
      for (const content of latestMessage.content) {
        if (content.type === 'text') {
          responseText += content.text.value;
        }
      }
      console.log('Chat API: Response text extracted', { 
        length: responseText.length,
        preview: responseText.substring(0, 50) + (responseText.length > 50 ? '...' : '')
      });

      if (!responseText) {
        console.error('Chat API: Empty response text from assistant');
        throw new Error('Empty response received from assistant');
      }

      // Save the assistant's response to the database
      try {
        // Make sure userId is a string
        const userIdString = String(userId);
        await saveMessageToDb(userIdString, responseText, false);
        console.log('Chat API: Assistant response saved to database');
      } catch (error) {
        console.log('Chat API: Error saving AI response:', error);
        // Continue even if saving fails
      }

      // Return the response text directly
      console.log('Chat API: Returning successful response');
      return new Response(responseText);
    } catch (assistantError) {
      console.error('Chat API: Error using Assistant API:', assistantError);
      
      // Try to provide more details for debugging
      if (assistantError instanceof Error) {
        console.error('Chat API: Error details:', {
          name: assistantError.name,
          message: assistantError.message,
          stack: assistantError.stack
        });
      }
      
      // Return a specific error response for Assistant API issues
      const errorMessage = assistantError instanceof Error 
        ? assistantError.message 
        : 'Unknown assistant error';
        
      return NextResponse.json(
        { error: `Assistant API Error: ${errorMessage}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Chat API: Unhandled error in chat API:', error);
    
    // Try to provide more details for debugging
    if (error instanceof Error) {
      console.error('Chat API: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'An error occurred during the conversation. Please try again later.' },
      { status: 500 }
    );
  }
}

// Helper function to poll for run completion
async function pollRunCompletion(openai: OpenAI, threadId: string, runId: string) {
  console.log('Polling for run completion...');
  
  let run = await openai.beta.threads.runs.retrieve(threadId, runId);
  console.log('Initial run status:', run.status);
  
  // Define terminal states where polling should stop
  const terminalStates = ['completed', 'failed', 'cancelled', 'expired'];
  
  // Poll until we reach a terminal state
  while (!terminalStates.includes(run.status)) {
    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the updated run status
    run = await openai.beta.threads.runs.retrieve(threadId, runId);
    console.log('Updated run status:', run.status);
  }
  
  return run;
}

async function saveMessageToDb(userId: string, content: string, isUserMessage: boolean) {
  try {
    // First check if the Message model/table exists
    const tableExists = await checkTableExists('Message');
    
    if (tableExists) {
      try {
        // Use the properly typed prisma client
        await prisma.$transaction(async (tx) => {
          // @ts-ignore - Access the model directly
          await tx.message.create({
            data: {
              content,
              userId,
              isUserMessage,
            },
          });
        });
      } catch (dbError) {
        console.error('Database error when saving message:', dbError);
      }
    }
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // For PostgreSQL
    await prisma.$queryRaw`SELECT 1 FROM information_schema.tables WHERE table_name=${tableName} AND table_schema='public'`;
    return true;
  } catch (error) {
    return false;
  }
}