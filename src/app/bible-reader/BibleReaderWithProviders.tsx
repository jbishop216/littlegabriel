'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { PasswordProvider } from '@/context/PasswordContext';
import { SessionProvider } from '@/components/SessionProvider';
import BibleReaderClient from './BibleReaderClient';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function BibleReaderContent() {
  const { isAuthenticated, isLoading } = useGlobalAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Use client-side authentication check with useEffect
  useEffect(() => {
    // Only redirect if we're sure the authentication state is fully loaded
    // This prevents flashes during navigation
    if (!isLoading && !isAuthenticated && !redirecting) {
      console.log('Bible Reader: Not authenticated, redirecting to login');
      setRedirecting(true);
      router.push('/login?callbackUrl=/bible-reader');
    }
  }, [isLoading, isAuthenticated, router, redirecting]);
  
  // Show loading state while checking authentication
  if (isLoading || redirecting) {
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
    return (
      <ThemeProvider>
        <PasswordProvider>
          <BibleReaderClient />
        </PasswordProvider>
      </ThemeProvider>
    );
  }
  
  // Return loading indicator while redirecting instead of null
  // This prevents the flash of content before redirect
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
      </div>
    </div>
  );
}

export default function BibleReaderWithProviders() {
  return (
    <SessionProvider>
      <BibleReaderContent />
    </SessionProvider>
  );
}
