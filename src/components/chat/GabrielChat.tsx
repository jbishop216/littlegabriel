import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/ThemeContext';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';
import MessageBubble from './MessageBubble';

// Define Message type locally if not imported
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasBeenTyped?: boolean;
};

// Custom interface for managing chat state with non-streaming API
export default function GabrielChat() {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Only scroll the chat component itself, not the whole page
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use scrollIntoView only on the chat container element itself
      const chatContent = messagesEndRef.current.closest('.overflow-y-auto');
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }
  }, [messages]);

  // Use the global auth hook to get authentication state
  const { user, isAuthenticated, isLoading, authToken } = useGlobalAuth();

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if already processing or input is empty
    if (isProcessing || !userInput.trim()) return;
    
    try {
      console.log('Submitting chat question:', { question: userInput });
      
      // Set processing state
      setIsProcessing(true);
      
      // Store the current user input before clearing it
      const currentInput = userInput;
      
      // Clear the input early for better UX
      setUserInput('');
      
      // Add the user message to the messages state
      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: currentInput,
        hasBeenTyped: true, // User messages don't need typing animation
      };
      
      // Remove any existing loading indicators and duplicate messages
      const uniqueMessages = [];
      const seenContents = new Set();
      
      for (const msg of messages) {
        // Skip loading indicators
        if (msg.content === '...') continue;
        
        // Skip duplicate messages (same role and content)
        const key = `${msg.role}:${msg.content}`;
        if (seenContents.has(key)) continue;
        
        seenContents.add(key);
        uniqueMessages.push(msg);
      }
      
      // Update messages with the user's message
      setMessages([...uniqueMessages, newUserMessage]);
      
      // Add a loading indicator message
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '...',
        hasBeenTyped: true // Loading indicator doesn't need typing animation
      };
      
      // Show the loading indicator after a small delay to prevent race conditions
      setTimeout(() => {
        if (!isProcessing) return; // Don't add if no longer processing
        
        setMessages(prevMessages => {
          // Remove any existing loading indicators
          const withoutLoading = prevMessages.filter(msg => msg.content !== '...');
          return [...withoutLoading, loadingMessage];
        });
      }, 100);
      
      // Send the message to the API
      try {
        console.log('Attempting to send message to primary API');
        let response;
        let assistantResponseText = '';
        let usedFallback = false;
        
        // Prepare the authentication data from our global auth hook
        const authData = {
          email: user?.email || '',
          userId: user?.id || '',
          hasDirectAuth: isAuthenticated,
          token: authToken || ''
        };
        
        console.log('Using auth data for API request:', {
          hasEmail: !!authData.email,
          hasUserId: !!authData.userId,
          isAuthenticated,
          hasToken: !!authData.token
        });
        
        try {
          // Use the OpenAI Assistant API instead of system prompts
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken ? `Bearer ${authToken}` : '',
              'X-User-Email': user?.email || ''
            },
            credentials: 'include', // Important for authentication cookies
            body: JSON.stringify({
              messages: [...messages, newUserMessage].map(m => ({
                role: m.role,
                content: m.content,
              })),
              userEmail: user?.email || ''
            }),
          });
          
          if (!response.ok) {
            console.warn(`Primary API failed with status: ${response.status}`);
            throw new Error(`API responded with status: ${response.status}`);
          }
          
          // Get the assistant's response as text (non-streaming)
          assistantResponseText = await response.text();
          console.log('Gabriel chat primary API response received', { 
            length: assistantResponseText.length,
            usedFallback: false 
          });
        } catch (primaryApiError) {
          console.log('Primary API failed, trying fallback API', primaryApiError);
          
          // If the main API fails, try the fallback API
          usedFallback = true;
          
          // Use the fallback chat API (direct completions-based)
          response = await fetch('/api/chat-fallback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authToken ? `Bearer ${authToken}` : ''
            },
            credentials: 'include', // Important for authentication cookies
            body: JSON.stringify({
              messages: [...messages, newUserMessage].map(m => ({
                role: m.role,
                content: m.content,
              })),
              auth: authData
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Fallback API responded with status: ${response.status}`);
          }
          
          // Get the response from the fallback API
          assistantResponseText = await response.text();
          console.log('Gabriel chat fallback API response received', { 
            length: assistantResponseText.length,
            usedFallback: true 
          });
        }
        
        if (!assistantResponseText || assistantResponseText.trim() === '') {
          throw new Error('Empty response received from API' + (usedFallback ? ' (fallback)' : ''));
        }
        
        // Replace the loading indicator with the actual response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantResponseText,
          hasBeenTyped: false, // Set to false so it will be typed out
        };
        
        // Remove the loading indicator and add the real response
        setMessages(prevMessages => {
          // Filter out the loading indicator message
          const messagesWithoutLoading = prevMessages.filter(msg => msg.content !== '...');
          return [...messagesWithoutLoading, assistantMessage];
        });
      } catch (error) {
        console.error('Error calling API:', error);
        
        // Remove the loading indicator
        setMessages(prevMessages => {
          return prevMessages.filter(msg => msg.content !== '...');
        });
        
        // You might want to display an error message to the user here
      }
      
      // Clear the processing state
      setIsProcessing(false);
      
    } catch (err) {
      // Use regular console.log instead of console.error to avoid showing the error dialog
      console.log('Gabriel chat caught an error:', err);
      setIsProcessing(false);
    }
  };

  // Start a new chat session
  const handleNewChat = () => {
    setMessages([]);
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    if (!isProcessing) {
      // Set the suggestion as input and submit the form programmatically
      setUserInput(suggestion);
      // Use setTimeout to ensure the state is updated before submitting
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
      }, 0);
    }
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
                onClick={() => handleSuggestionClick("How can I strengthen my faith during difficult times?")}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-gray-700/60"
              >
                <p className="font-medium text-gray-700 dark:text-gray-300 font-georgia">How can I strengthen my faith during difficult times?</p>
              </button>
              <button 
                onClick={() => handleSuggestionClick("What does the Bible teach about forgiveness?")}
                className="rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-gray-700/60"
              >
                <p className="font-medium text-gray-700 dark:text-gray-300 font-georgia">What does the Bible teach about forgiveness?</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div key={message.id}>
                <MessageBubble
                  message={message.content}
                  isUser={message.role === 'user'}
                  typing={message.role === 'assistant' && message.content !== '...' && !message.hasBeenTyped}
                  onTypingComplete={() => {
                    // Mark this message as having been typed
                    setMessages(prevMessages => 
                      prevMessages.map(msg => 
                        msg.id === message.id ? { ...msg, hasBeenTyped: true } : msg
                      )
                    );
                  }}
                />
              </div>
            ))}

            {isProcessing && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div key="loading-indicator">
                <MessageBubble
                  message="..."
                  isUser={false}
                  typing={false}
                />
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Message Input */}
      <form onSubmit={handleFormSubmit} className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:p-6">
        <div className="flex items-center space-x-2">
          <Button 
            type="button" 
            onClick={handleNewChat}
            disabled={isProcessing || messages.length === 0}
            className="rounded-full px-3 h-10 bg-gray-200 text-gray-600 hover:bg-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Button>
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isProcessing}
            className="flex-1 rounded-full border-gray-300 py-3 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !userInput.trim()}
            className="rounded-full bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isProcessing ? (
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