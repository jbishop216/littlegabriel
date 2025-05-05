'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PrayerRequestList from '@/components/prayer/PrayerRequestList';
import { Button } from '@/components/ui/button';

export default function PrayerRequestManagement() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  
  if (!session || session.user.role !== 'admin') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <h3 className="mb-2 text-lg font-medium">Access Denied</h3>
        <p>You do not have permission to access this admin section.</p>
      </div>
    );
  }

  const handleDeleteRequest = async (id: string): Promise<boolean | void> => {
    if (confirm('Are you sure you want to delete this prayer request?')) {
      try {
        const response = await fetch(`/api/prayer-requests/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete prayer request');
        }
        
        return true;
      } catch (error) {
        console.error('Error deleting prayer request:', error);
        alert('Failed to delete prayer request. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Prayer Request Management</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Review, approve, or reject prayer requests submitted by users. Approved requests will be visible to the community.
        </p>
        
        {/* Status tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap -mb-px">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                className={`mr-4 inline-flex items-center border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && (
                  <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                    New
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Request list */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <PrayerRequestList 
            session={session} 
            filter={activeTab !== 'all' ? activeTab : undefined}
            onDelete={handleDeleteRequest}
            viewType="admin"
          />
        </div>
      </div>
      
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Prayer Request Guidelines</h2>
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          <div className="flex items-start">
            <div className="mr-2 mt-1 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p><strong>Approve</strong> prayer requests that are appropriate, sincere, and align with community values.</p>
          </div>
          <div className="flex items-start">
            <div className="mr-2 mt-1 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p><strong>Reject</strong> prayer requests that contain inappropriate content, spam, or irrelevant material.</p>
          </div>
          <div className="flex items-start">
            <div className="mr-2 mt-1 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p><strong>Delete</strong> only in exceptional cases, such as accidental duplicates or when requested by the submitter.</p>
          </div>
        </div>
      </div>
    </div>
  );
}