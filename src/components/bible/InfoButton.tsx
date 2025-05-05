'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoButtonProps {
  message: string;
  className?: string;
}

export default function InfoButton({ message, className = '' }: InfoButtonProps) {
  const [showInfo, setShowInfo] = useState(true);
  
  // Auto-hide after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfo(false);
    }, 7000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <AnimatePresence>
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed bottom-10 right-10 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs z-50 ${className}`}
        >
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm">{message}</p>
            </div>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-white ml-4 self-start"
              aria-label="Close info"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}