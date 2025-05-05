'use client';

import { useState } from 'react';
import { searchBible } from '@/lib/services/bibleService';
import { motion } from 'framer-motion';

interface BibleSearchProps {
  bibleId: string;
  onVerseSelect: (bibleId: string, chapterId: string) => void;
}

interface SearchResult {
  reference: string;
  text: string;
  chapterId: string;
  verseId: string;
}

export default function BibleSearch({ bibleId, onVerseSelect }: BibleSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || !bibleId) return;
    
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const data = await searchBible(bibleId, searchQuery);
      
      if (data.verses && data.verses.length > 0) {
        setResults(
          data.verses.map((verse: any) => ({
            reference: verse.reference,
            text: verse.text,
            chapterId: verse.chapterId,
            verseId: verse.id
          }))
        );
      } else {
        setResults([]);
      }
    } catch (err) {
      setError('Failed to search the Bible. Please try again later.');
      console.error(`Error searching bible ${bibleId} for query "${searchQuery}":`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch} className="mb-6">
        <label htmlFor="search-input" className="mb-3 block text-lg font-bold text-white drop-shadow-sm">
          Search the Bible
        </label>
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter your search term..."
                className="block w-full rounded-l-xl pl-10 pr-4 py-3 text-base 
                          bg-white bg-opacity-90 backdrop-blur-md text-blue-900 
                          border-2 border-white border-opacity-50 shadow-lg
                          focus:border-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-opacity-50"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-r-xl 
                        bg-yellow-400 px-6 py-3 text-base font-bold text-blue-900 shadow-lg 
                        hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 
                        focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 
                        transition-all duration-200"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Search"
              )}
            </motion.button>
          </div>
        </div>
      </form>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl bg-red-500 bg-opacity-80 backdrop-blur-md p-4 text-white"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-white">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {hasSearched && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 border-white border-opacity-20 bg-white bg-opacity-90 backdrop-blur-md shadow-lg overflow-hidden"
        >
          <div className="border-b border-gray-200 bg-blue-500 bg-opacity-10 px-4 py-3">
            <h3 className="text-base font-bold text-blue-900">
              {results.length === 0
                ? 'No results found'
                : `Found ${results.length} result${results.length === 1 ? '' : 's'}`}
            </h3>
          </div>
          {results.length > 0 && (
            <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-blue-50"
                >
                  <motion.button
                    onClick={() => onVerseSelect(bibleId, result.chapterId)}
                    whileHover={{ scale: 1.01 }}
                    className="block w-full text-left"
                  >
                    <p className="font-bold text-blue-700">{result.reference}</p>
                    <p className="mt-1 text-gray-700">{result.text}</p>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}