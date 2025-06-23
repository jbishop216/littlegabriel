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
    // Check for direct auth if no NextAuth session
    if (!session) {
      const authState = getAuthStateFromLocalStorage();
      // Check for authenticated state and valid user data
      if (authState?.isAuthenticated && authState?.user) {
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
      }
    }
    setIsLoading(false);
  }, [session]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Use NextAuth session if available, otherwise use direct auth session
  const effectiveSession = session || directAuthSession;

  // If no session at all, show a message (this shouldn't happen due to middleware)
  if (!effectiveSession) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <p className="text-xl mb-4">Please log in to access the chat.</p>
        <a href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go to Login
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
