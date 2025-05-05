'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SermonFormProps {
  onGenerate: (data: SermonFormData) => Promise<void>;
  isLoading: boolean;
}

export interface SermonFormData {
  title?: string;
  biblePassage: string;
  theme: string;
  audienceType: string;
  lengthMinutes: number;
  additionalNotes?: string;
}

export default function SermonForm({ onGenerate, isLoading }: SermonFormProps) {
  const [formData, setFormData] = useState<SermonFormData>({
    title: '',
    biblePassage: '',
    theme: '',
    audienceType: 'general',
    lengthMinutes: 20,
    additionalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'lengthMinutes' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sermon Title (optional)
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Leave blank for AI to suggest"
            className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <div>
          <label htmlFor="biblePassage" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Bible Passage <span className="text-red-500">*</span>
          </label>
          <Input
            id="biblePassage"
            name="biblePassage"
            type="text"
            value={formData.biblePassage}
            onChange={handleChange}
            placeholder="e.g. John 3:16 or Matthew 5:1-12"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <div>
          <label htmlFor="theme" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sermon Theme <span className="text-red-500">*</span>
          </label>
          <Input
            id="theme"
            name="theme"
            type="text"
            value={formData.theme}
            onChange={handleChange}
            placeholder="e.g. Faith, Forgiveness, Hope, Love"
            required
            className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <div>
          <label htmlFor="audienceType" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target Audience
          </label>
          <select
            id="audienceType"
            name="audienceType"
            value={formData.audienceType}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="general">General Congregation</option>
            <option value="youth">Youth Group</option>
            <option value="children">Children's Service</option>
            <option value="elderly">Elderly Ministry</option>
            <option value="new-believers">New Believers</option>
            <option value="seekers">Spiritual Seekers</option>
          </select>
        </div>

        <div>
          <label htmlFor="lengthMinutes" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sermon Length (minutes)
          </label>
          <div className="flex items-center space-x-4">
            <input
              id="lengthMinutes"
              name="lengthMinutes"
              type="range"
              min="5"
              max="45"
              step="5"
              value={formData.lengthMinutes}
              onChange={handleChange}
              className="flex-1"
            />
            <span className="w-12 text-center">{formData.lengthMinutes}</span>
          </div>
        </div>

        <div>
          <label htmlFor="additionalNotes" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Notes (optional)
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows={3}
            placeholder="Special considerations, specific points to include, or other notes"
            className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !formData.biblePassage || !formData.theme}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-2 font-medium text-white hover:from-indigo-700 hover:to-blue-600 dark:from-indigo-500 dark:to-blue-400"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="mr-2 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Sermon...
          </div>
        ) : (
          'Generate Sermon'
        )}
      </Button>
    </form>
  );
}