'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { SessionProvider, signOut } from 'next-auth/react';

// Component that uses useRouter in a client context
function ClearAuthContent() {
  const [cleared, setCleared] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    try {
      // Clear all authentication
      localStorage.removeItem('gabriel-site-auth');
      localStorage.removeItem('gabriel-auth-token');
      
      // Also sign out from NextAuth
      signOut({ redirect: false })
        .then(() => {
          setCleared(true);
        })
        .catch(error => {
          console.error('Error signing out:', error);
          setCleared(true); // Still mark as cleared even if NextAuth signout fails
        });
    } catch (error) {
      console.error('Error clearing authentication:', error);
      setCleared(true); // Still mark as cleared if localStorage fails
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

// Wrap with SessionProvider to avoid SSR errors with useSession
export default function ClearAuthWithProviders() {
  return (
    <SessionProvider>
      <ClearAuthContent />
    </SessionProvider>
  );
}
