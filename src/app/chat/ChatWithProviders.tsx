'use client';

import { SessionProvider, useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ChatClient from './chat-client';
import { getAuthStateFromLocalStorage } from '@/lib/auth-utils';
import { useSearchParams } from 'next/navigation';

// Component that wraps ChatClient with SessionProvider
function ChatWithProviders() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  // Define proper type for the direct auth session
  const [directAuthSession, setDirectAuthSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authAttempted, setAuthAttempted] = useState(false);
  const [authRetries, setAuthRetries] = useState(0);

  // Check if this is a refresh attempt
  const isRefresh = searchParams?.get('refresh') !== null;

  useEffect(() => {
    console.log('Session status:', status);
    
    // If we're in a loading state, wait for it to resolve
    if (status === 'loading') {
      console.log('Session loading...');
      return;
    }

    // If we have a session, we're good to go
    if (session) {
      console.log('NextAuth session found:', session);
      setIsLoading(false);
      return;
    }
    
    // If we've already tried to authenticate and still don't have a session
    // Check for direct auth as a fallback
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
      console.log('No auth session found, status:', status);
      
      // If this is a refresh attempt and we still don't have a session
      // Try to force a session refresh, but only once to avoid infinite loops
      if (isRefresh && !authAttempted && authRetries < 2) {
        console.log('Refresh attempt detected, trying to refresh session...');
        setAuthAttempted(true);
        setAuthRetries(prev => prev + 1);
        
        // Small delay before attempting refresh
        setTimeout(() => {
          console.log('Attempting to refresh session...');
          // Try to refresh the session without a redirect
          window.location.href = '/api/auth/session';
        }, 500);
      }
    }
    
    setIsLoading(false);
  }, [session, status, isRefresh, authAttempted, authRetries]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Use NextAuth session if available, otherwise use direct auth session
  const effectiveSession = session || directAuthSession;

  // If no session at all, redirect to login
  if (!effectiveSession) {
    // Instead of showing an intermediate page, redirect directly to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    // Show a minimal loading state while redirecting
    return <div className="flex h-screen items-center justify-center">Redirecting to login...</div>;
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
