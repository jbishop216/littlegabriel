'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Custom hook to ensure authentication persistence across page navigations
 * This helps address issues with session cookies not being properly maintained
 */
export function useAuthPersistence() {
  const { data: session, status } = useSession();
  const [directAuthChecked, setDirectAuthChecked] = useState(false);
  const [hasDirectAuth, setHasDirectAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // First, check for direct authentication
  useEffect(() => {
    // Skip if we already checked or if we have a NextAuth session
    if (directAuthChecked || (status === 'authenticated' && !!session)) {
      return;
    }
    
    try {
      // Check for our direct auth token in localStorage
      const authUser = localStorage.getItem('gabriel-auth-user');
      const authToken = document.cookie.includes('gabriel-auth-token=');
      
      if (authUser && authToken) {
        // We have direct authentication
        setHasDirectAuth(true);
        localStorage.setItem('gabriel-site-auth', 'true');
        localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
        
        console.log('Direct authentication detected', {
          hasDirectAuth: true,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error('Error checking direct auth:', e);
    } finally {
      setDirectAuthChecked(true);
    }
  }, [session, status, directAuthChecked]);
  
  // Then handle NextAuth session persistence
  useEffect(() => {
    // Check if we're authenticated via NextAuth
    const isAuthenticated = status === 'authenticated' && !!session;
    
    // If authenticated via NextAuth, ensure we have the localStorage backup
    if (isAuthenticated) {
      try {
        localStorage.setItem('gabriel-site-auth', 'true');
        localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
        localStorage.setItem('gabriel-auth-email', session?.user?.email || '');
        
        // Log successful authentication persistence
        console.log('NextAuth authentication persisted to localStorage', { 
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
      isAuthenticated: isAuthenticated || hasDirectAuth,
      hasNextAuth: isAuthenticated,
      hasDirectAuth,
      pathname,
      session: session ? { 
        user: { 
          email: session.user?.email,
          name: session.user?.name
        } 
      } : null
    });
  }, [session, status, hasDirectAuth, pathname]);
  
  return { session, status, hasDirectAuth };
}
