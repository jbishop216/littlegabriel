'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface PrayerRequestFormProps {
  onSubmit: (data: { title: string; content: string; isAnonymous: boolean }) => Promise<void>;
}

export default function PrayerRequestForm({ onSubmit }: PrayerRequestFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; content?: string } = {};
    
    if (!title || title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!content || content.length < 10) {
      newErrors.content = 'Prayer request must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ title, content, isAnonymous });
      
      // Reset form after successful submission
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      setErrors({});
    } catch (error: any) {
      console.error('Error submitting prayer request:', error);
      
      // Handle validation errors from the server
      if (error.details) {
        setErrors(error.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Submit a Prayer Request</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 rounded-xl border ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Brief title for your prayer request"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Prayer Request
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={`w-full px-4 py-2 rounded-xl border ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="Share details about your prayer request..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                Submit anonymously
              </label>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}