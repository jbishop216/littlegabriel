'use client';

import { useEffect, useState } from 'react';
import { Chapter, getChapters } from '@/lib/services/bibleService';
import { motion } from 'framer-motion';

interface ChapterSelectorProps {
  bibleId: string;
  bookId: string;
  selectedChapter: string;
  onChapterSelect: (chapterId: string) => void;
}

export default function ChapterSelector({
  bibleId,
  bookId,
  selectedChapter,
  onChapterSelect,
}: ChapterSelectorProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChapters() {
      if (!bibleId || !bookId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getChapters(bibleId, bookId);
        setChapters(data);
      } catch (err) {
        console.error(`Failed to fetch chapters for Book ${bookId}:`, err);
        setError('Failed to load chapters. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    setChapters([]);
    fetchChapters();
  }, [bibleId, bookId]);

  return (
    <div>
      <label className="mb-3 block text-lg font-bold text-white drop-shadow-sm">
        Select Chapter
      </label>
      <div>
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
            Loading chapters...
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-5 lg:grid-cols-8"
          >
            {chapters.map((chapter, index) => (
              <motion.button
                key={chapter.id}
                onClick={() => onChapterSelect(chapter.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex h-12 w-full items-center justify-center rounded-xl text-base font-bold 
                           shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 
                           transition-all duration-200 ${
                  selectedChapter === chapter.id
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900'
                    : 'bg-white bg-opacity-90 backdrop-blur-sm text-blue-900 hover:bg-white'
                }`}
              >
                {chapter.number}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}