import { NextRequest, NextResponse } from 'next/server';
import { generateChatCompletion, Message } from '@/lib/chat/chatCompletions';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { messages = [] } = body;
    
    console.log('Chat Direct API: Received request with messages:', messages.length);
    
    // Validate the request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }
    
    // Get user information from headers if available
    const userEmail = request.headers.get('X-User-Email') || body.userEmail || '';
    
    // Generate a response using the chat completions API
    const responseText = await generateChatCompletion(messages, userEmail);
    
    // Return the response
    return new Response(responseText);
  } catch (error: any) {
    console.error('Chat Direct API: Error processing request:', error);
    
    return NextResponse.json({
      error: 'Failed to generate response',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
