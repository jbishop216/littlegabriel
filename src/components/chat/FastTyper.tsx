'use client';

import { useState, useEffect, useRef } from 'react';

interface FastTyperProps {
  text: string;
  onComplete?: () => void;
}

export default function FastTyper({ text, onComplete }: FastTyperProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Reset and start typing when text changes
  useEffect(() => {
    // Reset state
    setDisplayedText('');
    setIsComplete(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (!text) {
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }
    
    const cleanText = text.trim();
    let index = 0;
    let currentText = '';
    
    // Simple typing function that adds one character at a time
    const typeNextChar = () => {
      if (!isMounted.current) return;
      
      if (index < cleanText.length) {
        // Get the next character
        const char = cleanText.charAt(index);
        
        // Update our text
        currentText += char;
        setDisplayedText(currentText);
        
        // Move to next character
        index++;
        
        // Determine delay for next character
        let delay = 30; // Default typing speed
        
        // Add pause after punctuation
        if ((char === '.' || char === '!' || char === '?') && 
            index < cleanText.length && 
            cleanText.charAt(index) === ' ') {
          delay = 200; // Longer pause after punctuation
        }
        
        // Schedule next character
        timeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        // Typing complete
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    };
    
    // Start typing after a small delay
    timeoutRef.current = setTimeout(typeNextChar, 10);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isMounted.current = false;
    };
  }, [text, onComplete]);

  // Split text into paragraphs
  const paragraphs = displayedText.split('\n');
  
  return (
    <div className="inline-block whitespace-pre-wrap break-words">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index > 0 ? 'mt-2' : ''}>
          {paragraph}
          {/* Only show cursor in the last paragraph if typing is not complete */}
          {!isComplete && index === paragraphs.length - 1 && (
            <span className="inline-block h-4 w-2 animate-pulse bg-current opacity-70 ml-0.5"></span>
          )}
        </p>
      ))}
    </div>
  );
}
