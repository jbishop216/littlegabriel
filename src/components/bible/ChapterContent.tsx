'use client';

import React, { useEffect, useState } from 'react';
import { Verse, getChapterContent } from '@/lib/services/bibleService';
import { motion } from 'framer-motion';
import StrongsSidebar from './StrongsSidebar';
import InfoButton from './InfoButton';
import ClickableWord from './ClickableWord';
import { getBookIdFromChapterId, isOldTestament } from '@/lib/services/strongsService';

interface ChapterContentProps {
  bibleId: string;
  chapterId: string;
}

// Interface for parsed verse with clickable words
interface ParsedVerse {
  number: string;
  words: string[];
}

function parseVerses(content: string): ParsedVerse[] {
  const verses: ParsedVerse[] = [];
  
  // Remove any HTML tags that might be in the content
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // More flexible pattern to match various verse formats
  // This will match verse numbers at the start of a line, after spaces, or after HTML tags
  const versePattern = /(\d+)[\s]+([^0-9]+?)(?=\s+\d+\s+|$)/g;
  
  let match;
  let matchCount = 0;
  
  while ((match = versePattern.exec(plainText)) !== null) {
    matchCount++;
    const verseNumber = match[1];
    const verseText = match[2].trim();
    
    // Split the verse text into words
    // We'll keep punctuation attached to words to maintain readability
    const words = verseText.split(' ').filter(word => word.trim() !== '');
    
    verses.push({
      number: verseNumber,
      words: words
    });
  }
  
  // If no verses were found with the regex approach, try a fallback method
  if (verses.length === 0) {
    
    // Fallback: Try to split by newlines and then look for numbers at the start
    const lines = plainText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;
      
      // Check if the line starts with a number followed by a space
      const lineMatch = trimmed.match(/^(\d+)\s+(.*)/);
      if (lineMatch) {
        const verseNumber = lineMatch[1];
        const verseText = lineMatch[2].trim();
        
        console.log(`Fallback - Found verse ${verseNumber}: ${verseText.substring(0, 30)}...`);
        
        const words = verseText.split(' ').filter(word => word.trim() !== '');
        
        verses.push({
          number: verseNumber,
          words: words
        });
      }
    }
    
    console.log(`Fallback parsing found ${verses.length} verses`);
  }
  
  // If we still have no verses, try one more approach for APIs that return different formats
  if (verses.length === 0 && content.includes('class="verse"')) {
    console.log("Using HTML-based verse parsing...");
    
    // Some Bible APIs format content with CSS classes
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find all verse elements
    const verseElements = tempDiv.querySelectorAll('.verse');
    
    verseElements.forEach((verseEl) => {
      // Extract verse number (sometimes in a 'data-verse' attribute or a .verse-number element)
      let verseNumber = verseEl.getAttribute('data-verse') || 
                        (verseEl.querySelector('.verse-number')?.textContent || '').trim();
                        
      // If verse number is not found, try to get it from the first text
      if (!verseNumber) {
        const text = verseEl.textContent || '';
        const numMatch = text.match(/^(\d+)/);
        if (numMatch) {
          verseNumber = numMatch[1];
        }
      }
      
      if (verseNumber) {
        // Get the verse text and remove the verse number
        let verseText = (verseEl.textContent || '').trim();
        verseText = verseText.replace(new RegExp(`^${verseNumber}\\s*`), '');
        
        const words = verseText.split(' ').filter(word => word.trim() !== '');
        
        verses.push({
          number: verseNumber,
          words: words
        });
        
        console.log(`HTML - Found verse ${verseNumber}: ${verseText.substring(0, 30)}...`);
      }
    });
    
    console.log(`HTML parsing found ${verses.length} verses`);
  }
  
  return verses;
}

export default function ChapterContent({
  bibleId,
  chapterId,
}: ChapterContentProps) {
  const [chapter, setChapter] = useState<Verse | null>(null);
  const [verses, setVerses] = useState<ParsedVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for Strong's concordance sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');

  useEffect(() => {
    async function fetchChapterContent() {
      if (!bibleId || !chapterId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getChapterContent(bibleId, chapterId);
        setChapter(data);
        
        // Parse verse content into an array of verse objects with words
        if (data.content) {
          const parsedVerses = parseVerses(data.content);
          setVerses(parsedVerses);
        }
      } catch (err) {
        console.error(`Failed to fetch chapter content for ${chapterId}:`, err);
        setError('Failed to load chapter content. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    setChapter(null);
    setVerses([]);
    setSidebarOpen(false);
    setSelectedWord('');
    fetchChapterContent();
  }, [bibleId, chapterId]);

  // Handle word click to show Strong's concordance data
  const handleWordClick = (word: string) => {
    // Remove punctuation for the API lookup
    const cleanWord = word.replace(/[.,;:!?'"()\[\]{}]/g, '').toLowerCase();
    
    // Set the selected word first
    setSelectedWord(cleanWord);
    
    // Then open the sidebar
    setSidebarOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <svg className="mx-auto h-12 w-12 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-blue-800">Loading Scripture...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-red-500 bg-opacity-80 backdrop-blur-md p-4 text-white m-6"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-white font-medium">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-blue-800 font-medium text-lg">No chapter content available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-2 relative"
    >
      <motion.h2 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-4 text-2xl font-bold text-blue-900 border-b border-blue-200 pb-2"
      >
        {chapter.reference}
      </motion.h2>
      
      {chapter.copyright && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-4 text-xs text-blue-800 bg-blue-50 p-2 rounded-lg"
        >
          {chapter.copyright}
        </motion.div>
      )}
      
      <motion.div 
        className="space-y-3 text-gray-900 dark:text-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Always use the manual rendering approach since the verse parsing isn't reliable */}
        <div className="scripture-text text-base leading-relaxed text-justify tracking-tight font-georgia text-gray-900 dark:text-gray-100">
          {(() => {
            // This is a direct text-based approach to make every word clickable
            // without relying on the parsing logic
            try {
              const text = chapter.content;
              
              // Remove HTML tags but preserve the verse structure
              const cleanText = text.replace(/<[^>]*>/g, '');
              
              // Simple regex to identify verse numbers followed by text
              const verseRegex = /(\d+)\s+([^0-9]+?)(?=\s+\d+\s+|$)/g;
              let match;
              let lastIndex = 0;
              let formattedContent = [];
              
              // Process each verse
              while ((match = verseRegex.exec(cleanText)) !== null) {
                const verseNumber = match[1];
                const verseText = match[2].trim();
                const words = verseText.split(' ').filter(w => w.trim() !== '');
                
                // Create the verse element with clickable words
                formattedContent.push(
                  <motion.span 
                    key={`verse-${verseNumber}`} 
                    className="inline verse-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <sup className="mr-0.5 font-bold text-blue-600 verse-number">{verseNumber}</sup>
                    {words.map((word, idx) => (
                      <React.Fragment key={`word-${verseNumber}-${idx}`}>
                        <ClickableWord
                          word={word}
                          onClick={handleWordClick}
                        />
                        {idx < words.length - 1 && ' '}
                      </React.Fragment>
                    ))}
                    {' '}
                  </motion.span>
                );
              }
              
              // If we successfully parsed verses, return them
              if (formattedContent.length > 0) {
                return formattedContent;
              }
              
              // FALLBACK 1: Direct word-by-word splitting approach
              
              // Just split the entire text by spaces and make each word clickable
              const allWords = cleanText.split(' ').filter(w => w.trim() !== '');
              
              if (allWords.length > 0) {
                return (
                  <motion.div 
                    className="inline text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {allWords.map((word, idx) => {
                      // Identify if this word starts with a digit (likely a verse number)
                      const isVerseNumber = /^\d+/.test(word);
                      
                      if (isVerseNumber) {
                        const parts = word.match(/^(\d+)(.*)$/);
                        if (parts) {
                          const num = parts[1];
                          const rest = parts[2];
                          
                          return (
                            <React.Fragment key={`split-${idx}`}>
                              <sup className="mr-0.5 font-bold text-blue-600 verse-number">{num}</sup>
                              {rest && (
                                <ClickableWord
                                  word={rest}
                                  onClick={handleWordClick}
                                />
                              )}
                              {' '}
                            </React.Fragment>
                          );
                        }
                      }
                      
                      return (
                        <React.Fragment key={`split-${idx}`}>
                          <ClickableWord
                            word={word}
                            onClick={handleWordClick}
                          />
                          {' '}
                        </React.Fragment>
                      );
                    })}
                  </motion.div>
                );
              }
              
              // FALLBACK 2: Direct HTML rendering with warning
              return (
                <div>
                  <div className="mb-4 p-2 rounded bg-yellow-100 text-yellow-800">
                    <strong>Note:</strong> Strong's concordance clickable words are not available for this text format. 
                    Using standard rendering instead.
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />
                </div>
              );
            } catch (err) {
              // Final fallback in case of any errors
              return (
                <div>
                  <div className="mb-4 p-2 rounded bg-red-100 text-red-800">
                    <strong>Error:</strong> Could not render interactive Bible text. 
                    Using standard rendering instead.
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br />') }} />
                </div>
              );
            }
          })()}
        </div>
      </motion.div>

      {/* Strong's Concordance Sidebar */}
      <StrongsSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedWord={selectedWord}
        chapterId={chapterId}
      />
      
      {/* Info button to highlight the feature */}
      <InfoButton message="NEW FEATURE: Click on any blue word to see its original Hebrew or Greek meaning. Blue words have Strong's Concordance data available." />

      <style jsx global>{`
        .scripture-text .verse-text:hover {
          background-color: rgba(59, 130, 246, 0.05);
          border-radius: 0.25rem;
        }
        .scripture-text .verse-text {
          padding: 0;
          transition: background-color 0.2s ease;
        }
        .verse-number {
          font-size: 0.75rem;
          vertical-align: super;
        }
        .word-span {
          cursor: pointer;
          position: relative;
          color: #2c5282; /* Blue-800 equivalent */
          transition: all 0.2s ease;
        }
        .word-span:hover {
          background-color: rgba(59, 130, 246, 0.15);
          color: #1e40af; /* Blue-900 equivalent */
          text-decoration: underline dotted;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .word-span:hover::after {
          content: 'Click for Strong\'s';
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(30, 58, 138, 0.9);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          white-space: nowrap;
          z-index: 10;
        }
      `}</style>
    </motion.div>
  );
}