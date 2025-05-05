'use client';

import { useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UseBibleChatOptions {
  onFinish?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export function useBibleChat(options?: UseBibleChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = useCallback(
    async (userInput: string) => {
      if (!userInput.trim() || isLoading) return;
      
      // Add user message to state
      const userMessage: ChatMessage = { role: 'user', content: userInput };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);
      setError(null);
      
      try {
        let responseText = '';
        
        // Use the server API endpoint for chat
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Read the streaming response
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is not readable');
        
        const decoder = new TextDecoder();
        
        // Start with just the user message - we'll add the assistant message when we get content
        let responseStarted = false;
        
        // Read and process the stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          // Decode the chunk and add to response text
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // If this is the first chunk with content, add the assistant message
          if (!responseStarted && responseText.trim()) {
            responseStarted = true;
            // Add the assistant message to the conversation
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: responseText }
            ]);
          } else if (responseStarted) {
            // Update the existing assistant message with new content
            setMessages(prev => {
              const updatedMessages = [...prev];
              updatedMessages[updatedMessages.length - 1] = {
                role: 'assistant',
                content: responseText
              };
              return updatedMessages;
            });
          }
        }
        
        // Call onFinish callback if provided
        if (options?.onFinish) {
          options.onFinish({ role: 'assistant', content: responseText });
        }
      } catch (err) {
        console.error('Chat error:', err);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        // Add error message to chat
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `I'm sorry, I encountered an error: ${error.message}. Please try again.`
          }
        ]);
        
        if (options?.onError) {
          options.onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, options]
  );

  return {
    messages,
    handleSubmit,
    isLoading,
    error,
    setMessages
  };
}