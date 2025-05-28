import { NextRequest, NextResponse } from 'next/server';
import { generateChatCompletion } from '@/lib/chat/chatCompletions';

// Bible-specific system prompt
const BIBLE_SYSTEM_PROMPT = `You are Gabriel, a knowledgeable Christian AI assistant specializing in biblical studies.
Focus exclusively on providing biblical insights, historical context, and scriptural explanation rather than personal counseling or therapy.
Analyze biblical text, explain meanings, provide historical background, clarify theological concepts, and give cross-references to other relevant passages.
Prioritize scholarly biblical information over therapeutic or emotional support.
ALWAYS format your responses as well-structured paragraphs in a scholarly tone, similar to a seminary professor.
NEVER use bullet points or numbered lists. Format your response as a cohesive essay with clear transitions between ideas.
Integrate scripture references naturally within paragraphs.
You should encourage users to connect with a local church for deeper support and community.`;

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { messages = [] } = body;
    
    console.log('Bible Chat Direct API: Received request with messages:', messages.length);
    
    // Validate the request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }
    
    // Get user information from headers if available
    const userEmail = request.headers.get('X-User-Email') || body.userEmail || '';
    
    // Replace any system message with our Bible-specific system prompt
    const chatMessages = messages.filter(m => m.role !== 'system');
    chatMessages.unshift({ role: 'system', content: BIBLE_SYSTEM_PROMPT });
    
    // Generate a response using the chat completions API
    const responseText = await generateChatCompletion(chatMessages, userEmail);
    
    // Return the response
    return new Response(responseText);
  } catch (error: any) {
    console.error('Bible Chat Direct API: Error processing request:', error);
    
    return NextResponse.json({
      error: 'Failed to generate response',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
