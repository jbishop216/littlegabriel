'use client';

import { useEffect, useState } from 'react';
import { Book, getBooks } from '@/lib/services/bibleService';
import { motion } from 'framer-motion';

interface BookSelectorProps {
  bibleId: string;
  selectedBook: string;
  onBookSelect: (bookId: string) => void;
}

export default function BookSelector({
  bibleId,
  selectedBook,
  onBookSelect,
}: BookSelectorProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      if (!bibleId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getBooks(bibleId);
        setBooks(data);
      } catch (err) {
        console.error(`Failed to fetch books for Bible ${bibleId}:`, err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    setBooks([]);
    fetchBooks();
  }, [bibleId]);

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onBookSelect(e.target.value);
  };

  return (
    <div className="mb-4">
      <label htmlFor="book-selector" className="mb-3 block text-lg font-bold text-white drop-shadow-sm">
        Select Book
      </label>
      <div className="relative">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-12 items-center justify-center rounded-xl bg-white bg-opacity-30 backdrop-blur-md px-4 text-white"
          >
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading books...
          </motion.div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-12 items-center justify-center rounded-xl bg-red-500 bg-opacity-80 backdrop-blur-md px-4 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        ) : (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <select
              id="book-selector"
              value={selectedBook}
              onChange={handleBookChange}
              className="block w-full pl-10 pr-10 py-3 text-base rounded-xl 
                        bg-white bg-opacity-90 backdrop-blur-md text-blue-900 font-medium
                        border-2 border-white border-opacity-50
                        focus:border-yellow-300 focus:ring focus:ring-yellow-300 focus:ring-opacity-50
                        shadow-lg appearance-none"
              disabled={books.length === 0}
            >
              <option value="">-- Select a Book --</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.nameLong || book.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}