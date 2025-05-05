'use client';

import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Component that uses useRouter in a Suspense boundary
function ClearAuthContent() {
  const [cleared, setCleared] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    try {
      // Clear the site authentication
      localStorage.removeItem('gabriel-site-auth');
      setCleared(true);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);
  
  const handleGoHome = () => {
    router.push('/');
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Reset
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {cleared 
              ? "Your authentication has been cleared successfully. You'll need to enter the site password again."
              : "Clearing authentication..."}
          </p>
        </div>
        
        {cleared && (
          <Button onClick={handleGoHome} className="w-full">
            Go to Home Page
          </Button>
        )}
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ClearAuthPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ClearAuthContent />
    </Suspense>
  );
}