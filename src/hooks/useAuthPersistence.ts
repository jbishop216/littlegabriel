'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Custom hook to ensure authentication persistence across page navigations
 * This helps address issues with session cookies not being properly maintained
 */
export function useAuthPersistence() {
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // Check if we're authenticated via NextAuth
    const isAuthenticated = status === 'authenticated' && !!session;
    
    // If authenticated, ensure we have the localStorage backup
    if (isAuthenticated) {
      try {
        localStorage.setItem('gabriel-site-auth', 'true');
        localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
        localStorage.setItem('gabriel-auth-email', session?.user?.email || '');
        
        // Log successful authentication persistence
        console.log('Authentication persisted to localStorage', { 
          email: session?.user?.email,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to persist authentication to localStorage', e);
      }
    }
    
    // Log current authentication state
    console.log('Auth state check:', { 
      status, 
      isAuthenticated,
      session: session ? { 
        user: { 
          email: session.user?.email,
          name: session.user?.name
        } 
      } : null
    });
  }, [session, status]);
  
  return { session, status };
}
