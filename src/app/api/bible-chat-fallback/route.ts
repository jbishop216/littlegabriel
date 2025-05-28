import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/openai';
import { ENV } from '@/lib/env';
import OpenAI from 'openai';

// Direct implementation of Bible chat using the chat completion API
// This is a fallback for when the Assistant API isn't working properly

type MessageForAPI = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authHeader = req.headers.get('authorization');
    const userEmail = req.headers.get('x-user-email');
    
    // Get cookies for session-based auth
    const cookies = req.cookies;
    const sessionToken = cookies.get('next-auth.session-token')?.value || cookies.get('__Secure-next-auth.session-token')?.value;
    
    // Log authentication attempt
    console.log('Bible chat fallback auth check:', { 
      hasAuthHeader: !!authHeader,
      hasUserEmail: !!userEmail,
      hasSessionToken: !!sessionToken
    });
    
    // Parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Bible Chat Fallback API: Failed to parse request body', parseError);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    const { messages } = requestBody;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('Bible Chat Fallback API: Invalid messages array', { 
        messagesProvided: !!messages, 
        isArray: Array.isArray(messages), 
        length: messages?.length 
      });
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    console.log('Bible Chat Fallback API: Received valid messages array', { messageCount: messages.length });

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY || ENV.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Bible Chat Fallback API: Missing OpenAI API key');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please contact the administrator.' }, 
        { status: 503 }
      );
    }

    // Get the OpenAI client
    console.log('Bible Chat Fallback API: Creating OpenAI client');
    const openai = createClient();
    
    try {
      // Create a system message to instruct the model how to behave
      const systemMessage = {
        role: 'system',
        content: `You are a biblical expert with deep knowledge of Scripture, theology, history, and biblical languages. 
        Provide accurate biblical information, scriptural analysis, historical context, and theological insights. 
        Focus on explaining Bible passages with scholarly precision and theological depth.
        When appropriate, reference relevant verses and include historical background.
        You should be respectful of diverse Christian traditions while remaining faithful to the biblical text.
        Be thorough yet accessible, focusing on helping users understand the Bible deeply.
        
        IMPORTANT FORMATTING INSTRUCTIONS:
        1. ALWAYS respond in well-structured paragraphs, NOT bullet points or numbered lists
        2. Use a conversational, scholarly tone similar to a seminary professor
        3. Format your response as a cohesive essay with clear transitions between ideas
        4. If you need to present multiple points, integrate them into paragraphs rather than listing them
        5. Scripture references should be integrated naturally into your paragraphs
        6. Avoid using headings, bullet points, or any list formatting`
      };
      
      // Create a properly typed array of messages for the OpenAI API
      const formattedMessages: Array<MessageForAPI> = [];
      
      // Add the system message first
      formattedMessages.push({
        role: 'system',
        content: systemMessage.content
      });
      
      // Add user messages, keeping only the last 10 to avoid token limits
      for (const msg of messages.slice(-10)) {
        if (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') {
          formattedMessages.push({
            role: msg.role as 'system' | 'user' | 'assistant',
            content: msg.content
          });
        } else {
          // Default to user role for any unexpected role values
          formattedMessages.push({
            role: 'user',
            content: msg.content
          });
        }
      }
      
      console.log('Bible Chat Fallback API: Sending request to OpenAI');
      console.log('Bible Chat Fallback API: Using message count:', formattedMessages.length);
      
      // Make the request to the OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });
      
      // Extract the response text
      const responseText = completion.choices[0].message.content;
      console.log('Bible Chat Fallback API: Received response from OpenAI', {
        length: responseText?.length || 0,
        preview: responseText?.substring(0, 50) + (responseText && responseText.length > 50 ? '...' : '') || 'Empty response'
      });
      
      if (!responseText) {
        console.error('Bible Chat Fallback API: Empty response from OpenAI');
        throw new Error('Empty response received from OpenAI');
      }
      
      // Return the response as plain text
      console.log('Bible Chat Fallback API: Returning successful response');
      return new Response(responseText);
      
    } catch (apiError) {
      console.error('Bible Chat Fallback API: Error calling OpenAI:', apiError);
      
      // Try to provide more details for debugging
      if (apiError instanceof Error) {
        console.error('Bible Chat Fallback API: Error details:', {
          name: apiError.name,
          message: apiError.message,
          stack: apiError.stack
        });
      }
      
      const errorMessage = apiError instanceof Error 
        ? apiError.message 
        : 'Unknown API error';
        
      return NextResponse.json(
        { error: `OpenAI API Error: ${errorMessage}` },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Bible Chat Fallback API: Unhandled error:', error);
    
    if (error instanceof Error) {
      console.error('Bible Chat Fallback API: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'An error occurred during the Bible chat conversation. Please try again later.' },
      { status: 500 }
    );
  }
}
