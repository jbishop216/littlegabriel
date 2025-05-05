'use client';

import { useState } from 'react';
import BibleSelector from '@/components/bible/BibleSelector';
import BookSelector from '@/components/bible/BookSelector';
import ChapterSelector from '@/components/bible/ChapterSelector';
import ChapterContent from '@/components/bible/ChapterContent';
import BibleSearch from '@/components/bible/BibleSearch';
import BibleChat from '@/components/bible/BibleChat';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import GlobalLayout from '@/components/GlobalLayout';
import { useTheme } from '@/context/ThemeContext';
import BackgroundDecorator from '@/components/BackgroundDecorator';

// Import the BibleMap component with no SSR to prevent Leaflet issues
const BibleMap = dynamic(
  () => import('@/components/bible/BibleMap'),
  { ssr: false }
);

enum TabType {
  READ = 'read',
  SEARCH = 'search',
}

export default function BibleReaderClient() {
  // Get the theme from context
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState<TabType>(TabType.READ);
  // Set default to American Standard Version (06125adad2d5898a-01)
  const [selectedBible, setSelectedBible] = useState<string>('06125adad2d5898a-01');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  const handleBibleSelect = (bibleId: string) => {
    setSelectedBible(bibleId);
    setSelectedBook('');
    setSelectedChapter('');
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter('');
  };

  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapter(chapterId);
  };

  const handleVerseSelect = (bibleId: string, chapterId: string) => {
    setSelectedBible(bibleId);
    setSelectedChapter(chapterId);
    setActiveTab(TabType.READ);
  };

  // Use different background classes based on the theme
  const backgroundClass = isDarkMode 
    ? "bg-gradient-to-r from-green-950 via-slate-900 to-green-950" 
    : "bg-gradient-to-r from-green-600 via-yellow-300 to-green-600";

  // Bible study UI content
  const bibleStudyContent = (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="mb-6 text-4xl font-extrabold text-white drop-shadow-md md:text-5xl"
        initial={{ scale: 0.9, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Bible Study
      </motion.h1>
      
      <motion.div 
        className="mb-6 flex flex-col md:flex-row md:gap-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="md:w-1/4 mb-4 md:mb-0">
          <BibleSelector
            selectedBible={selectedBible}
            onBibleSelect={handleBibleSelect}
          />
        </div>
        
        {/* Map section - in the top right corner */}
        <div className="md:w-3/4">
          {selectedBible && selectedChapter ? (
            <motion.div
              key={selectedChapter} // Key helps React recreate component when chapter changes
              className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} bg-opacity-95 backdrop-blur-md p-4 shadow-lg rounded-xl`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Biblical Locations</h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedChapter && selectedChapter.replace('.', ' ')}
                </p>
              </div>
              
              {/* Properly loaded BibleMap component with no SSR */}
              <BibleMap chapterId={selectedChapter} height="250px" />
            </motion.div>
          ) : (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} bg-opacity-95 backdrop-blur-md p-4 shadow-lg rounded-xl`}>
              <div className="h-[250px] flex items-center justify-center">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} text-center`}>
                  Select a chapter to view its biblical locations on the map
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      
      {selectedBible && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex border-b border-white border-opacity-30">
            <button
              className={`px-5 py-3 text-md font-bold transition-all ${
                activeTab === TabType.READ
                  ? 'border-b-2 border-white text-white'
                  : 'text-white text-opacity-70 hover:text-opacity-100'
              }`}
              onClick={() => setActiveTab(TabType.READ)}
            >
              Read Scripture
            </button>
            <button
              className={`px-5 py-3 text-md font-bold transition-all ${
                activeTab === TabType.SEARCH
                  ? 'border-b-2 border-white text-white'
                  : 'text-white text-opacity-70 hover:text-opacity-100'
              }`}
              onClick={() => setActiveTab(TabType.SEARCH)}
            >
              Search Verses
            </button>
          </div>
          
          {activeTab === TabType.READ ? (
            <div className="grid gap-8 md:grid-cols-5">
              <div className="space-y-6 md:col-span-2">
                {selectedBible && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BookSelector
                      bibleId={selectedBible}
                      selectedBook={selectedBook}
                      onBookSelect={handleBookSelect}
                    />
                  </motion.div>
                )}
                
                {selectedBible && selectedBook && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <ChapterSelector
                      bibleId={selectedBible}
                      bookId={selectedBook}
                      selectedChapter={selectedChapter}
                      onChapterSelect={handleChapterSelect}
                    />
                  </motion.div>
                )}
                
                {/* Bible Chat component - with enhanced visibility */}
                {selectedBible && selectedChapter && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="mt-6 relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Highlight badge */}
                    <div className="absolute -top-3 -right-3 z-10">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-green-600 rounded-full animate-pulse">
                        AI Assistant
                      </span>
                    </div>
                    
                    {/* Enhanced shadow and border for more visibility */}
                    <BibleChat
                      bibleId={selectedBible}
                      chapterId={selectedChapter}
                      className={`${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'} bg-opacity-95 shadow-lg rounded-xl border-2 border-green-400`}
                    />
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                className="md:col-span-3"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} bg-opacity-95 backdrop-blur-md p-6 shadow-lg rounded-xl`}>
                  {selectedBible && selectedChapter ? (
                    <ChapterContent
                      bibleId={selectedBible}
                      chapterId={selectedChapter}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-center">
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {selectedBible && selectedBook
                          ? 'Select a chapter to start reading'
                          : selectedBible
                          ? 'Select a book to continue'
                          : 'Select a Bible version to get started'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-5">
              <motion.div 
                className="md:col-span-2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <BibleSearch
                  bibleId={selectedBible}
                  onVerseSelect={handleVerseSelect}
                />
              </motion.div>
              <motion.div 
                className="md:col-span-3"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} bg-opacity-95 backdrop-blur-md p-6 shadow-lg rounded-xl`}>
                  {selectedBible && selectedChapter ? (
                    <ChapterContent
                      bibleId={selectedBible}
                      chapterId={selectedChapter}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-center">
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Search for a verse and click on a result to view the chapter
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );

  return (
    <div>
      <BackgroundDecorator />
      <GlobalLayout>
        {bibleStudyContent}
      </GlobalLayout>
    </div>
  );
}