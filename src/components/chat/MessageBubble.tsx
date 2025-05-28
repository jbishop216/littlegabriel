'use client';

import { useState, useEffect } from 'react';
import TypewriterText from './TypewriterText';

type MessageBubbleProps = {
  message: string;
  isUser: boolean;
  typing?: boolean;
  onTypingComplete?: () => void;
  compact?: boolean;
};

export default function MessageBubble({ 
  message, 
  isUser, 
  typing = false,
  onTypingComplete,
  compact = false
}: MessageBubbleProps) {
  const [showTyping, setShowTyping] = useState(typing);
  const [showContent, setShowContent] = useState(!typing);

  useEffect(() => {
    if (typing) {
      setShowTyping(true);
      setShowContent(false);
    } else {
      // When not typing, show the content immediately
      setShowTyping(false);
      setShowContent(true);
    }
  }, [typing]);

  const handleTypingComplete = () => {
    // Notify that typing is complete but don't auto-scroll
    if (onTypingComplete) {
      onTypingComplete();
    }
  };

  return (
    <div 
      className={`mb-2 flex animate-fade-in ${isUser ? 'justify-end' : 'justify-start'} ${
        compact ? 'gap-2' : 'gap-3' 
      }`}
    >
      {/* Display assistant avatar for non-user messages */}
      {!isUser && (
        <div className={`mt-1 flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md dark:from-indigo-600 dark:to-blue-700 ${
          compact ? 'h-7 w-7' : 'h-10 w-10'
        }`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className={compact ? 'h-4 w-4' : 'h-6 w-6'}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" 
            />
          </svg>
        </div>
      )}

      <div 
        className={`relative rounded-2xl shadow-md ${
          compact ? 'px-3 py-2 max-w-[90%]' : 'px-5 py-3 max-w-[85%] md:max-w-[75%] lg:max-w-[65%]'
        } ${
          isUser 
            ? 'rounded-tr-none bg-gradient-to-r from-indigo-600 to-blue-500 text-white dark:from-indigo-500 dark:to-blue-400' 
            : 'rounded-tl-none bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}
      >
        {/* Chat bubble pointer */}
        <div 
          className={`absolute top-0 ${compact ? 'h-2 w-2' : 'h-3 w-3'} ${
            isUser 
              ? 'right-0 -translate-x-px rounded-bl-none bg-indigo-600 dark:bg-indigo-500' 
              : 'left-0 translate-x-px rounded-br-none bg-white dark:bg-gray-800'
          }`} 
          style={{ 
            [isUser ? 'right' : 'left']: compact ? -3 : -5,
            transform: `rotate(${isUser ? '45deg' : '-45deg'})`,
          }}
        ></div>

        {/* Message content with typing effect */}
        <div className={`${compact ? 'text-xs' : 'text-[15px]'} leading-relaxed ${isUser ? 'text-right' : ''}`}>
          {/* Special handling for the typing indicator ("...") */}
          {message === "..." ? (
            <div className="flex items-center space-x-2 py-1">
              <div className={`animate-pulse rounded-full bg-gray-500 dark:bg-gray-400 ${compact ? 'h-2 w-2' : 'h-3 w-3'}`}></div>
              <div className={`animate-pulse rounded-full bg-gray-500 dark:bg-gray-400 ${compact ? 'h-2 w-2' : 'h-3 w-3'}`} style={{ animationDelay: '300ms' }}></div>
              <div className={`animate-pulse rounded-full bg-gray-500 dark:bg-gray-400 ${compact ? 'h-2 w-2' : 'h-3 w-3'}`} style={{ animationDelay: '600ms' }}></div>
            </div>
          ) : (
            /* Regular message content display with or without typing effect */
            showTyping ? (
              <TypewriterText 
                text={message} 
                speed={compact ? 30 : 50}
                onComplete={() => {
                  setShowTyping(false);
                  setShowContent(true);
                  handleTypingComplete();
                }} 
              />
            ) : (
              <div className="whitespace-pre-wrap">{message}</div>
            )
          )}
        </div>
      </div>

      {/* Display user avatar for user messages */}
      {isUser && (
        <div className={`mt-1 flex flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 shadow-md dark:bg-gray-700 dark:text-gray-300 ${
          compact ? 'h-7 w-7' : 'h-10 w-10'
        }`}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={compact ? 'h-4 w-4' : 'h-6 w-6'}
          >
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}