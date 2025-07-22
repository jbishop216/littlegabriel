import { createClient } from '@/lib/openai';
import { ENV } from '@/lib/env';

// Define message types
export type Role = 'user' | 'assistant' | 'system';
export type Message = {
  role: Role;
  content: string;
};

// System prompt for Gabriel
// TEMPORARILY DISABLED FOR TESTING - Using OpenAI Assistant instead
/*
const SYSTEM_PROMPT = `You are Gabriel, a friendly and knowledgeable Christian AI assistant. 
You provide biblically sound advice and insights based on scripture (ESV version).
You're here to help with questions about faith, provide biblical context, and offer spiritual guidance.
Always respond in a conversational, warm tone while maintaining scholarly accuracy.
Format your responses as well-structured paragraphs, not bullet points or lists.
When referencing scripture, integrate it naturally into your paragraphs.
You should encourage users to connect with a local church for deeper support and community.`;
*/

/**
 * Generates a chat completion using the OpenAI API
 */
export async function generateChatCompletion(messages: Message[], userEmail?: string) {
  try {
    console.log('Chat Completions: Processing request with messages:', messages.length);
    
    // Get the OpenAI client
    const openai = createClient();
    
    // Ensure we have a valid API key
    const apiKey = ENV.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Chat Completions: Missing OpenAI API key');
      throw new Error('Missing OpenAI API key');
    }
    
    // Add the system prompt as the first message if not already present
    // TEMPORARILY DISABLED - Testing without system prompt
    const chatMessages = messages.some(m => m.role === 'system')
      ? messages
      : [/* { role: 'system', content: SYSTEM_PROMPT }, */ ...messages];
    
    console.log('Chat Completions: Sending request to OpenAI');
    
    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use the latest model
      messages: chatMessages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // Extract the response
    const responseContent = completion.choices[0].message.content;
    console.log('Chat Completions: Received response from OpenAI');
    
    return responseContent;
  } catch (error) {
    console.error('Chat Completions: Error generating completion:', error);
    throw error;
  }
}
