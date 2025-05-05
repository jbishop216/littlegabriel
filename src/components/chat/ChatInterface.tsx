'use client';

import { useState, useRef, useEffect } from 'react';
import { useCustomChat } from '@/lib/hooks/useCustomChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageBubble from './MessageBubble';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatInterface() {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use the custom chat hook
  const { 
    messages,
    input, 
    handleInputChange, 
    handleSubmit: originalHandleSubmit, 
    isLoading, 
    setMessages,
    setInput
  } = useCustomChat({
    onFinish: () => {
      // Add a small delay before removing the typing indicator
      setTimeout(() => {
        setIsTyping(false);
      }, 250);
    }
  });
  
  // Ensure the typing indicator shows when loading state changes
  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
    }
  }, [isLoading]);

  // Handle form submission with improved typing indicator
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Store the current input
    const currentInput = input;
    
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: currentInput };
    
    // Add a temporary assistant message with "..." to trigger typing indicator
    const typingMessage: ChatMessage = { role: 'assistant', content: '...' };
    
    // Add both messages to the UI immediately
    setMessages([...messages, userMessage, typingMessage]);
    
    // Clear the input field
    setInput('');
    
    // Set typing state to true
    setIsTyping(true);
    
    // Make the API call directly
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.body?.getReader();
    })
    .then(reader => {
      if (!reader) throw new Error('Response body is not readable');
      
      const decoder = new TextDecoder();
      let responseText = '';
      
      // Function to read stream chunks
      function readChunk(): Promise<void> {
        return reader!.read().then(({ done, value }) => {
          if (done) {
            setIsTyping(false);
            return;
          }
          
          // Decode the chunk and add to text
          const chunk = decoder.decode(value, { stream: true });
          
          // Log the exact raw chunk for debugging (only in development)
          console.log('Raw chunk received:', chunk);
          
          // In this version, we'll take a simpler approach - just remove all numbers followed by quotes
          let cleanedChunk = chunk.replace(/\d+"/g, '"').replace(/\d+'/g, "'");
          
          // Further clean by removing any "data: " prefixes
          if (cleanedChunk.includes('data: ')) {
            try {
              // Split by newlines to process each data: line separately
              const lines = cleanedChunk.split('\n');
              cleanedChunk = '';
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Check if it starts with "data: "
                if (trimmedLine.startsWith('data: ')) {
                  const jsonStr = trimmedLine.slice(6); // Remove "data: " prefix
                  
                  if (jsonStr && jsonStr !== '[DONE]') {
                    try {
                      const data = JSON.parse(jsonStr);
                      if (data && typeof data.text === 'string') {
                        // Log the parsed data for debugging
                        console.log('Parsed text from JSON:', data.text);
                        cleanedChunk += data.text;
                      }
                    } catch (parseError) {
                      // If this particular line fails to parse, extract content without JSON
                      console.log('Extracting without JSON parsing:', jsonStr);
                      
                      // Direct replacement of 0" with just "
                      const cleaned = jsonStr.replace(/\d+"/g, '"').replace(/\d+'/g, "'");
                      cleanedChunk += cleaned;
                    }
                  }
                } else if (trimmedLine.length > 0) {
                  // Just add any non-empty line that doesn't start with data:
                  cleanedChunk += trimmedLine;
                }
              }
            } catch (e) {
              console.log('Error processing stream lines:', e);
              // If all else fails, just strip the numbers before quotes
              cleanedChunk = chunk.replace(/\d+"/g, '"').replace(/\d+'/g, "'");
            }
          }
          
          // Update accumulated response text
          responseText += cleanedChunk;
          
          // Update the last message with the current text
          setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1] = {
              role: 'assistant',
              content: responseText
            };
            return updatedMessages;
          });
          
          // Continue reading
          return readChunk();
        });
      }
      
      // Start reading the stream
      return readChunk();
    })
    .catch(error => {
      console.error('Error in chat:', error);
      setIsTyping(false);
      
      // Replace the typing message with an error message
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        { 
          role: 'assistant', 
          content: `I'm sorry, I encountered an error. Please try again.` 
        }
      ]);
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-10 w-10 text-indigo-600 dark:text-indigo-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Start a Conversation with Gabriel</h3>
            <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
              Ask a question about faith, request spiritual guidance, or explore Biblical teachings. Gabriel is here to provide compassionate, faith-centered counsel.
            </p>
            <div className="mt-6 grid gap-3 text-left md:grid-cols-2">
              <button 
                onClick={() => handleInputChange({ target: { value: "How can I strengthen my faith during difficult times?" } } as any)}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-gray-700/60"
              >
                <p className="font-medium text-gray-700 dark:text-gray-300">How can I strengthen my faith during difficult times?</p>
              </button>
              <button 
                onClick={() => handleInputChange({ target: { value: "What does the Bible teach about forgiveness?" } } as any)}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-gray-700/60"
              >
                <p className="font-medium text-gray-700 dark:text-gray-300">What does the Bible teach about forgiveness?</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: { content: string; role: string }, index: number) => {
              return (
                <MessageBubble
                  key={index}
                  message={message.content}
                  isUser={message.role === 'user'}
                  typing={false} // Disable typewriter effect
                  onTypingComplete={() => setIsTyping(false)}
                />
              );
            })}
            {/* Only show stand-alone typing indicator when no messages exist at all */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-start">
                <div className="mr-3 mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md dark:from-indigo-600 dark:to-blue-700">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="h-6 w-6"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
                    />
                  </svg>
                </div>
                <div className="relative max-w-[85%] rounded-2xl rounded-tl-none bg-white px-5 py-3 text-gray-800 shadow-md dark:bg-gray-800 dark:text-gray-200 md:max-w-[75%] lg:max-w-[65%]">
                  <div className="absolute left-0 top-0 h-3 w-3 translate-x-px rounded-br-none bg-white dark:bg-gray-800" style={{ left: -5, transform: 'rotate(-45deg)' }}></div>
                  <div className="flex items-center space-x-2 py-1">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-gray-500 dark:bg-gray-400"></div>
                    <div className="h-3 w-3 animate-pulse rounded-full bg-gray-500 dark:bg-gray-400" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-3 w-3 animate-pulse rounded-full bg-gray-500 dark:bg-gray-400" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Message Input */}
      <form onSubmit={onSubmit} className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-full border-gray-300 py-3 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isLoading ? (
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}