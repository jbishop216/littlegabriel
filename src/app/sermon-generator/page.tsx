'use client';

import SermonGeneratorClient from './sermon-generator-client';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SermonGeneratorPage() {
  const { isAuthenticated, isLoading, user } = useGlobalAuth();
  const router = useRouter();
  
  // Use client-side authentication check with useEffect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/sermon-generator');
    }
  }, [isLoading, isAuthenticated, router]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Only render the client component if authenticated
  if (isAuthenticated) {
    return <SermonGeneratorClient />;  
  }
  
  // Return null while redirecting
  return null;
}