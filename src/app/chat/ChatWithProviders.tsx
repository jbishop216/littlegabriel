'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ChatClient from './chat-client';
import { getAuthStateFromLocalStorage } from '@/lib/auth-utils';

// Component that wraps ChatClient with SessionProvider
function ChatWithProviders() {
  const { data: session } = useSession();
  // Define proper type for the direct auth session
  const [directAuthSession, setDirectAuthSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First check if we have a NextAuth session
    if (session) {
      console.log('NextAuth session found:', session);
      setIsLoading(false);
      return;
    }
    
    // If no NextAuth session, check for direct auth
    const authState = getAuthStateFromLocalStorage();
    console.log('Auth state from localStorage:', authState);
    
    // Check for authenticated state and valid user data
    if (authState?.isAuthenticated && authState?.user) {
      console.log('Direct auth session found');
      // Create a placeholder session for direct auth users
      setDirectAuthSession({
        user: { 
          id: 'direct-auth-user',
          email: authState.email || 'authenticated-user@direct-auth',
          role: 'user',
          name: authState.user?.name || 'Direct Auth User'
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });
    } else {
      console.log('No auth session found');
    }
    
    setIsLoading(false);
  }, [session]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Use NextAuth session if available, otherwise use direct auth session
  const effectiveSession = session || directAuthSession;

  // If no session at all, try to redirect to homepage and back to chat
  // This helps with Google auth where the session might need a refresh
  if (!effectiveSession) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <p className="text-xl mb-4">Checking authentication status...</p>
        <p className="text-sm mb-4">If you're not redirected automatically, please click below:</p>
        <a 
          href="/?redirectTo=/chat" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={(e) => {
            e.preventDefault();
            // Try to refresh the page first to see if session is available
            window.location.href = '/?redirectTo=/chat';
          }}
        >
          Refresh Authentication
        </a>
      </div>
    );
  }

  return <ChatClient session={effectiveSession as any} />;
}

// Wrapper component that provides the session context
export default function ChatWithProvidersWrapper() {
  return (
    <SessionProvider>
      <ChatWithProviders />
    </SessionProvider>
  );
}
