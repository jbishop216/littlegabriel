'use client';

import React from 'react';
import { hasStrongsEntry } from '@/lib/services/strongsWordList';

interface ClickableWordProps {
  word: string;
  onClick: (word: string) => void;
}

export default function ClickableWord({ word, onClick }: ClickableWordProps) {
  // Clean the word for pattern matching (remove punctuation)
  const cleanWord = word.replace(/[.,;:!?'"()\[\]{}]/g, '').toLowerCase();
  
  // Check if this word has an entry in our actual Strong's database
  const hasEntry = hasStrongsEntry(cleanWord);
  
  // Special highlighting for key theological terms (these are important regardless of database entries)
  const isKeyTheologicalTerm = [
    'god', 'jesus', 'christ', 'lord', 'holy', 'spirit', 'gospel',
    'messiah', 'salvation', 'faith', 'grace', 'sin', 'love'
  ].includes(cleanWord);
  
  return (
    <button
      onClick={() => onClick(word)}
      className={`
        inline px-0 mx-0 rounded cursor-pointer transition-all
        ${hasEntry 
          ? 'text-blue-700 hover:bg-blue-100 hover:text-blue-900' 
          : 'text-gray-700 hover:bg-gray-200'}
        ${isKeyTheologicalTerm 
          ? 'font-semibold' 
          : ''
        }
      `}
      title={hasEntry 
        ? `Click to see Hebrew/Greek meaning for "${word}"` 
        : `Try looking up "${word}" in Strong's Concordance`
      }
      aria-label={`Look up Strong's Concordance for the word "${word}"`}
    >
      {word}
    </button>
  );
}