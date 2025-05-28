'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface DirectAuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface UseDirectAuthReturn {
  user: DirectAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  directLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

/**
 * Custom hook for direct authentication that works around NextAuth issues in Vercel
 */
export function useDirectAuth(): UseDirectAuthReturn {
  const [user, setUser] = useState<DirectAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Also use NextAuth session as a fallback
  const { data: session } = useSession();
  
  // Check for authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check for our direct auth cookie
        const authUser = localStorage.getItem('gabriel-auth-user');
        if (authUser) {
          try {
            const userData = JSON.parse(authUser);
            setUser(userData);
            return;
          } catch (e) {
            console.error('Failed to parse auth user data:', e);
          }
        }
        
        // Then check for NextAuth session as fallback
        if (session?.user) {
          setUser({
            id: session.user.id as string,
            email: session.user.email as string,
            name: session.user.name || undefined,
            role: (session.user as any).role || 'user',
          });
          return;
        }
        
        // If we get here, user is not authenticated
        setUser(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [session]);
  
  // Direct login function
  const directLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Get the base URL - important for production environments
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const apiUrl = `${baseUrl}/api/auth/direct-login`;
      
      console.log('Attempting direct login with API URL:', apiUrl);
      
      // Call our direct login API with credentials and same-origin
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'same-origin', // Important for cookie handling
      });
      
      const data = await response.json();
      
      // Log response for debugging
      console.log('Direct login response status:', response.status);
      
      // Log headers in a TypeScript-friendly way
      const headerMap: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerMap[key] = value;
      });
      console.log('Direct login headers:', headerMap);
      
      console.log('Direct login cookies set:', document.cookie.includes('gabriel-auth-token'));
      
      if (!response.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || 'Login failed' 
        };
      }
      
      // Store user data in localStorage for client-side access
      localStorage.setItem('gabriel-auth-user', JSON.stringify(data.user));
      localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
      localStorage.setItem('gabriel-site-auth', 'true');
      
      // Update state
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      console.error('Direct login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during login' 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('gabriel-auth-user');
    localStorage.removeItem('gabriel-auth-timestamp');
    
    // Clear state
    setUser(null);
    
    // Clear cookies by setting them to expire
    document.cookie = 'gabriel-auth-token=; Max-Age=0; path=/;';
    document.cookie = 'gabriel-auth-user=; Max-Age=0; path=/;';
    
    // Redirect to login page
    router.push('/login');
  };
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    directLogin,
    logout,
  };
}
