'use client';

import { useEffect, useState } from 'react';
import { Bible, getBibles } from '@/lib/services/bibleService';
import { motion } from 'framer-motion';

interface BibleSelectorProps {
  selectedBible: string;
  onBibleSelect: (bibleId: string) => void;
}

export default function BibleSelector({
  selectedBible,
  onBibleSelect,
}: BibleSelectorProps) {
  const [bibles, setBibles] = useState<Bible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBibles() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBibles();
        // Sort bibles by language name and then by bible name
        const sortedBibles = data.sort((a, b) => {
          if (a.language.name !== b.language.name) {
            return a.language.name.localeCompare(b.language.name);
          }
          return a.name.localeCompare(b.name);
        });
        setBibles(sortedBibles);
      } catch (err) {
        console.error('Failed to fetch bibles:', err);
        setError('Failed to load Bible versions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchBibles();
  }, []);

  const handleBibleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onBibleSelect(e.target.value);
  };

  // Group bibles by language
  const biblesByLanguage: Record<string, Bible[]> = {};
  bibles.forEach((bible) => {
    const languageName = bible.language.name;
    if (!biblesByLanguage[languageName]) {
      biblesByLanguage[languageName] = [];
    }
    biblesByLanguage[languageName].push(bible);
  });

  return (
    <div className="mb-4">
      <label htmlFor="bible-selector" className="mb-2 block text-sm font-bold text-white drop-shadow-sm">
        Select Bible Version
      </label>
      <div className="relative">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-10 items-center justify-center rounded-lg bg-white bg-opacity-30 backdrop-blur-md px-4 text-white text-sm"
          >
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-10 items-center justify-center rounded-lg bg-red-500 bg-opacity-80 backdrop-blur-md px-4 text-white text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <select
              id="bible-selector"
              value={selectedBible}
              onChange={handleBibleChange}
              className="block w-full pl-7 pr-7 py-2 text-sm rounded-lg 
                       bg-white bg-opacity-90 backdrop-blur-md text-blue-900 font-medium
                       border-2 border-white border-opacity-50
                       focus:border-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-opacity-50
                       shadow-lg appearance-none"
            >
              <option value="">Select Bible</option>
              {Object.entries(biblesByLanguage).map(([language, languageBibles]) => (
                <optgroup key={language} label={language} className="font-semibold">
                  {languageBibles.map((bible) => (
                    <option key={bible.id} value={bible.id} className="py-1">
                      {bible.name} ({bible.abbreviation})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}