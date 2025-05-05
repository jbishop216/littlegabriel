'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StrongsEntry, 
  getStrongsData, 
  getBookIdFromChapterId, 
  getLanguageForBook 
} from '@/lib/services/strongsService';

interface StrongsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWord: string;
  chapterId: string;
  className?: string;
}

export default function StrongsSidebar({
  isOpen,
  onClose,
  selectedWord,
  chapterId,
  className = ''
}: StrongsSidebarProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [strongsData, setStrongsData] = useState<StrongsEntry | null>(null);
  
  useEffect(() => {
    async function fetchStrongsData() {
      if (!selectedWord || !chapterId) {
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Determine if we're in Old or New Testament to know which language to use
        const bookId = getBookIdFromChapterId(chapterId);
        const language = getLanguageForBook(bookId);
        
        // Fetch Strong's data for the selected word
        const data = await getStrongsData(selectedWord, language);
        setStrongsData(data);
        
        if (!data) {
          setError(`No Strong's data found for "${selectedWord}"`);
        }
      } catch (err) {
        console.error(`Failed to fetch Strong's data:`, err);
        setError(`Failed to load Strong's data. Please try again later.`);
      } finally {
        setLoading(false);
      }
    }
    
    if (isOpen && selectedWord) {
      fetchStrongsData();
    }
  }, [isOpen, selectedWord, chapterId]);
  
  // Reset data when the sidebar is closed
  useEffect(() => {
    if (!isOpen) {
      setStrongsData(null);
      setError(null);
    }
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - closes the sidebar when clicked */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto dark:bg-slate-800 dark:text-white ${className}`}
            style={{ boxShadow: '0 0 25px rgba(0,0,0,0.3)' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-blue-800">
                Strong's Concordance
              </h3>
              <button 
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label="Close sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-700 mb-1">Selected Word</h4>
                <p className="text-lg font-bold text-blue-900">{selectedWord}</p>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <div className="bg-red-50 text-red-600 p-3 rounded-md">
                    <p className="font-medium mb-1">Strong's Data Not Found</p>
                    <p className="text-sm">{error}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">About Strong's Concordance</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Not every word has a Strong's entry. Words in <span className="text-blue-700 font-medium">blue</span> generally have entries, while words in <span className="text-gray-700">black</span> may not.
                    </p>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      <li>Nouns and important theological terms</li>
                      <li>Verbs and key action words</li>
                      <li>Names of people, places, and concepts</li>
                    </ul>
                    <p className="text-sm text-gray-700 mt-2">
                      Try these words with known entries: "gospel", "Jesus", "faith", "God", "spirit", "kingdom", "glory", "blood", "heart", "soul".
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-500 italic">
                    Note: This is a demonstration with limited data. A full Strong's database would have entries for thousands of biblical words.
                  </div>
                </div>
              ) : strongsData ? (
                <div className="space-y-4">
                  {/* Original Word */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Original {strongsData.language === 'hebrew' ? 'Hebrew' : 'Greek'} Word
                    </h4>
                    <p className="text-2xl font-bold" dir={strongsData.language === 'hebrew' ? 'rtl' : 'ltr'}>
                      {strongsData.originalWord}
                    </p>
                  </div>
                  
                  {/* Transliteration */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Transliteration
                    </h4>
                    <p className="text-lg italic">
                      {strongsData.transliteration}
                    </p>
                  </div>
                  
                  {/* Strong's Number */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Strong's Number
                    </h4>
                    <p className="text-lg font-mono bg-blue-50 rounded px-2 py-1 inline-block">
                      {strongsData.strongsNumber}
                    </p>
                  </div>
                  
                  {/* Definition */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">
                      Definition
                    </h4>
                    <p className="text-base text-gray-800">
                      {strongsData.definition}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a word from the Bible text to see its original language details.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}