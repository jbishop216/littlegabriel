import { useState, useEffect, useRef } from 'react';
import MessageBubble from '@/components/chat/MessageBubble';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Message } from 'ai';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';

interface BibleChatProps {
  bibleId: string;
  chapterId: string;
  className?: string;
}

export default function BibleChat({ bibleId, chapterId, className = '' }: BibleChatProps) {
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, authToken, user } = useGlobalAuth();
  
  // Extract book and chapter info from chapterId (e.g., "MRK.4" to "Mark 4")
  const bookCode = chapterId.split('.')[0];
  const chapterNumber = chapterId.split('.')[1];
  
  // Map of Bible book codes to full names
  const bookNameMap: Record<string, string> = {
    'GEN': 'Genesis', 
    'EXO': 'Exodus',
    'LEV': 'Leviticus',
    'NUM': 'Numbers',
    'DEU': 'Deuteronomy',
    'JOS': 'Joshua',
    'JDG': 'Judges',
    'RUT': 'Ruth',
    '1SA': '1 Samuel',
    '2SA': '2 Samuel',
    '1KI': '1 Kings',
    '2KI': '2 Kings',
    '1CH': '1 Chronicles',
    '2CH': '2 Chronicles',
    'EZR': 'Ezra',
    'NEH': 'Nehemiah',
    'EST': 'Esther',
    'JOB': 'Job',
    'PSA': 'Psalms',
    'PRO': 'Proverbs',
    'ECC': 'Ecclesiastes',
    'SNG': 'Song of Solomon',
    'ISA': 'Isaiah',
    'JER': 'Jeremiah',
    'LAM': 'Lamentations',
    'EZK': 'Ezekiel',
    'DAN': 'Daniel',
    'HOS': 'Hosea',
    'JOL': 'Joel',
    'AMO': 'Amos',
    'OBA': 'Obadiah',
    'JON': 'Jonah',
    'MIC': 'Micah',
    'NAM': 'Nahum',
    'HAB': 'Habakkuk',
    'ZEP': 'Zephaniah',
    'HAG': 'Haggai',
    'ZEC': 'Zechariah',
    'MAL': 'Malachi',
    'MAT': 'Matthew',
    'MRK': 'Mark',
    'LUK': 'Luke',
    'JHN': 'John',
    'ACT': 'Acts',
    'ROM': 'Romans',
    '1CO': '1 Corinthians',
    '2CO': '2 Corinthians',
    'GAL': 'Galatians',
    'EPH': 'Ephesians',
    'PHP': 'Philippians',
    'COL': 'Colossians',
    '1TH': '1 Thessalonians',
    '2TH': '2 Thessalonians',
    '1TI': '1 Timothy',
    '2TI': '2 Timothy',
    'TIT': 'Titus',
    'PHM': 'Philemon',
    'HEB': 'Hebrews',
    'JAS': 'James',
    '1PE': '1 Peter',
    '2PE': '2 Peter',
    '1JN': '1 John',
    '2JN': '2 John',
    '3JN': '3 John',
    'JUD': 'Jude',
    'REV': 'Revelation'
  };

  // Get the full book name
  const bookName = bookNameMap[bookCode] || bookCode;
  const currentReference = `${bookName} ${chapterNumber}`;
  
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

  // Clear messages when changing chapters
  useEffect(() => {
    setMessages([]);
  }, [chapterId]);

  // Handle form submission with context and error handling
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Include the Bible reference in the user's question for context
      const contextualInput = `Regarding ${currentReference}: ${userInput}`;
      
      console.log('Submitting Bible chat question:', { reference: currentReference, question: userInput });
      
      // Add user message to the messages state
      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: contextualInput,
      };
      
      // Update messages with the user's message
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // Add a loading indicator message
      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '...'
      };
      
      // Show the loading indicator
      setMessages(prevMessages => [...prevMessages, loadingMessage]);
      
      // Clear the input early for better UX
      setUserInput('');
      
      // Send the message to the API
      try {
        console.log('Attempting to send message to primary Bible chat API');
        let response;
        let assistantResponseText = '';
        
        try {
          // Use the direct Bible chat API that preserves conversation history
          response = await fetch('/api/bible-chat-direct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
              ...(user?.email ? { 'X-User-Email': user.email } : {})
            },
            body: JSON.stringify({
              messages: [...messages, newUserMessage].map(m => ({
                role: m.role,
                content: m.content,
              })),
              userEmail: user?.email,
            }),
            credentials: 'include',
            cache: 'no-store',
          });
          
          if (!response.ok) {
            console.warn(`Bible chat API failed with status: ${response.status}`);
            
            // Try to get more detailed error information
            let errorDetails = '';
            try {
              const errorResponse = await response.json();
              errorDetails = errorResponse.message || errorResponse.details || errorResponse.error || '';
              console.error('Bible chat API error details:', errorResponse);
            } catch (parseError) {
              // If we can't parse the error response, just use the status
              console.error('Could not parse error response:', parseError);
            }
            
            throw new Error(`Bible chat API error (${response.status}): ${errorDetails}`);
          }
          
          // Get the assistant's response as text (non-streaming)
          assistantResponseText = await response.text();
          console.log('Bible chat API response received', { 
            length: assistantResponseText.length,
            preview: assistantResponseText.substring(0, 50) + '...'
          });
        } catch (apiError: any) {
          console.error('Bible chat API error:', apiError);
          
          // Instead of falling back, show the error to help debug the issue
          setError(`Error connecting to Bible chat assistant: ${apiError?.message || 'Unknown error'}. Please try again later.`);
          setIsProcessing(false);
          return; // Exit early since we can't proceed
        }
        
        if (!assistantResponseText || assistantResponseText.trim() === '') {
          throw new Error('Empty response received from API');
        }
        
        // Replace the loading indicator with the actual response
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantResponseText
        };
        
        // Remove the loading indicator and add the real response
        setMessages(prevMessages => {
          // Filter out the loading indicator message
          const messagesWithoutLoading = prevMessages.filter(msg => msg.content !== '...');
          return [...messagesWithoutLoading, assistantMessage];
        });
        setError(null);
      } catch (apiError: any) {
        console.error('Error calling Bible chat API:', apiError);
        
        // Remove the loading indicator
        setMessages(prevMessages => {
          return prevMessages.filter(msg => msg.content !== '...');
        });
        
        setError(`Error: ${apiError.message || 'Unknown error'}`);
        setIsProcessing(false);
      }
      
      // Clear the processing state
      setIsProcessing(false);
      
    } catch (err) {
      console.log('Bible chat caught an error:', err);
      setIsProcessing(false);
    }
  };

  // Start a new chat session
  const handleNewChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Card className={`flex flex-col max-w-full ${className}`}>
      <CardHeader className="p-3 border-b flex flex-row justify-between items-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-xl">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
            />
          </svg>
          <h3 className="text-sm font-bold">Bible Study Assistant</h3>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleNewChat} 
          className="text-xs py-1 h-7 bg-white text-green-600 hover:bg-gray-100"
        >
          New Chat
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80 text-sm">
        {error ? (
          // Show error message if there is one
          <div className="text-center p-4 my-2 border border-dashed border-red-300 rounded-lg bg-red-50">
            <div className="mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-red-500 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-red-800">Sorry, there was an error</p>
            <p className="text-xs text-red-600 mt-1">Please try again or refresh the page</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2"
            >
              Refresh
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 my-2 border border-dashed border-green-300 rounded-lg bg-green-50">
            <div className="mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-green-500 mx-auto" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-800">I can help you understand {currentReference}</p>
            <p className="text-xs text-green-600 mt-1">Ask about historical context, meanings, theological concepts, or cross-references to other passages</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message.content}
              isUser={message.role === 'user'}
              typing={false} // Disable typewriter effect for Bible chat
              compact={true}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="border-t p-3 bg-gray-50">
        <form onSubmit={handleFormSubmit} className="flex w-full space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Ask about ${currentReference}...`}
            disabled={isProcessing}
            className="flex-1 text-sm h-9 shadow-sm border-green-200 focus-visible:ring-green-500"
          />
          <Button 
            type="submit" 
            disabled={isProcessing || !userInput.trim()} 
            className="h-9 text-xs px-3 bg-green-600 hover:bg-green-700 text-white"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3 w-3 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 5l7 7-7 7M5 5l7 7-7 7" 
              />
            </svg>
            Ask
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}