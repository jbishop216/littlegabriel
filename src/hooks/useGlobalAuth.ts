'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthStateFromLocalStorage } from '@/lib/auth-utils';

/**
 * Global authentication hook that combines NextAuth and direct authentication
 * This hook provides a unified interface for authentication state across the application
 */
export function useGlobalAuth() {
  const { data: session, status } = useSession();
  const [directAuthUser, setDirectAuthUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check authentication state on mount and when session/pathname changes
  useEffect(() => {
    const checkAuthState = () => {
      try {
        // First check if we have a NextAuth session
        const hasNextAuth = status === 'authenticated' && !!session;
        
        // Then check for direct authentication
        const authState = getAuthStateFromLocalStorage();
        
        // Set authentication state
        const isAuth = hasNextAuth || authState.isAuthenticated;
        setIsAuthenticated(isAuth);
        
        // Set direct auth user if available
        if (authState.user) {
          setDirectAuthUser(authState.user);
        }
        
        // Log authentication state for debugging
        console.log('Global auth state:', {
          hasNextAuth,
          directAuth: authState,
          isAuthenticated: isAuth,
          pathname
        });
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthState();
  }, [session, status, pathname]);
  
  // Function to handle logout
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('gabriel-auth-user');
    localStorage.removeItem('gabriel-auth-timestamp');
    localStorage.removeItem('gabriel-auth-email');
    localStorage.removeItem('gabriel-site-auth');
    
    // Clear state
    setDirectAuthUser(null);
    setIsAuthenticated(false);
    
    // Clear cookies by setting them to expire
    document.cookie = 'gabriel-auth-token=; Max-Age=0; path=/;';
    document.cookie = 'gabriel-auth-user=; Max-Age=0; path=/;';
    document.cookie = 'gabriel-site-auth=; Max-Age=0; path=/;';
    
    // Redirect to login page
    router.push('/login');
  };
  
  // Get the effective user (either from NextAuth or direct auth)
  const user = session?.user || directAuthUser;
  
  // Get the auth token from localStorage or cookies
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Get the auth token on mount and when auth state changes
  useEffect(() => {
    // Try to get token from localStorage first
    const token = localStorage.getItem('gabriel-auth-token');
    if (token) {
      setAuthToken(token);
      return;
    }
    
    // If we have a session, we can use that
    if (session?.user) {
      // For NextAuth, we don't have direct access to the token
      // but we can set a placeholder to indicate we're authenticated
      setAuthToken('session-auth-token');
      return;
    }
    
    // No token found
    setAuthToken(null);
  }, [session, isAuthenticated]);
  
  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
    session,
    status,
    authToken
  };
}
