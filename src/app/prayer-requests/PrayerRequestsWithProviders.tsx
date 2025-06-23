'use client';

import { SessionProvider } from '@/components/SessionProvider';
import PrayerRequestsClient from './prayer-requests-client';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function PrayerRequestsContent() {
  const { isAuthenticated, isLoading, session, user } = useGlobalAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  
  // Use client-side authentication check with useEffect
  useEffect(() => {
    // Only redirect if we're sure the authentication state is fully loaded
    // This prevents flashes during navigation
    if (!isLoading && !isAuthenticated && !redirecting) {
      console.log('Prayer Requests: Not authenticated, redirecting to login');
      setRedirecting(true);
      router.push('/login?callbackUrl=/prayer-requests');
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
    // If we have a real session, use it
    if (session) {
      return <PrayerRequestsClient session={session} />;
    }
    
    // Otherwise create a minimal session object with the required fields
    const safeSession = {
      user: { 
        id: 'direct-auth-user',
        email: user?.email || 'authenticated-user@direct-auth',
        role: 'user',
        name: user?.email || 'Authenticated User'
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Use type assertion to satisfy TypeScript
    return <PrayerRequestsClient session={safeSession as any} />;  
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

export default function PrayerRequestsWithProviders() {
  return (
    <SessionProvider>
      <PrayerRequestsContent />
    </SessionProvider>
  );
}
