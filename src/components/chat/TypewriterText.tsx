'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export default function TypewriterText({ 
  text, 
  speed = 5, // Much faster typing speed (was 15)
  onComplete 
}: TypewriterTextProps) {
  // Remove any numeric prefixes from the input text before processing
  const cleanedText = text
    .replace(/^\d+:["']?\s*/g, '')               // Remove prefixes at start (0:)
    .replace(/\s\d+:["']?\s*/g, ' ')             // Remove prefixes after spaces (0:)
    .replace(/\s{2,}/g, ' ')                      // Normalize spaces
    .trim();                                      // Trim extra whitespace
  
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMounted = useRef(true);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Reset state when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsPaused(false);
    
    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }, [text]);

  // Handle typing effect with setInterval for more consistent performance
  useEffect(() => {
    // Don't start if text is empty or typing is completed
    if (!cleanedText || currentIndex >= cleanedText.length || isPaused) return;
    
    // Start the typing interval
    const startTypingInterval = () => {
      // Clear any existing interval first
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      
      // Create new interval that adds multiple characters every X milliseconds for faster typing
      typingIntervalRef.current = setInterval(() => {
        if (!isMounted.current) return;

        if (currentIndex < cleanedText.length) {
          // Get the next character
          const nextChar = cleanedText[currentIndex];
          
          // Add it to displayed text
          setDisplayedText(prev => prev + nextChar);
          setCurrentIndex(prevIndex => prevIndex + 1);
          
          // Very brief pauses after punctuation
          if (
            (nextChar === '.' || nextChar === '!' || nextChar === '?') && 
            currentIndex < cleanedText.length - 1 && 
            cleanedText[currentIndex + 1] === ' '
          ) {
            // Pause typing for a moment
            setIsPaused(true);
            clearInterval(typingIntervalRef.current!);
            typingIntervalRef.current = null;
            
            // Resume after a very short pause (50-100ms)
            setTimeout(() => {
              if (isMounted.current) {
                setIsPaused(false);
              }
            }, 50 + Math.random() * 50);
          }
        } else {
          // Typing complete, clear interval
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          
          // Notify parent component immediately
          if (onComplete) {
            if (isMounted.current) {
              onComplete();
            }
          }
        }
      }, speed); // Much faster speed for typing
    };
    
    // Start typing with no initial delay
    const initialDelayTimeout = setTimeout(() => {
      if (isMounted.current) {
        startTypingInterval();
      }
    }, 10);
    
    return () => {
      clearTimeout(initialDelayTimeout);
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [cleanedText, currentIndex, isPaused, speed, onComplete]);

  return (
    <span className="whitespace-pre-wrap">
      {displayedText}
      {currentIndex < cleanedText.length && (
        <span className="inline-block h-4 w-2 animate-pulse bg-current opacity-70 ml-0.5"></span>
      )}
    </span>
  );
}
