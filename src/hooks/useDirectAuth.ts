'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

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
  
  // Function to handle direct login
  const directLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Special case for admin user with known credentials
      if (email.toLowerCase() === 'jbishop216@gmail.com' && password === 'g@mecok3') {
        console.log('Admin user detected, using special login flow');
        // Create admin user object
        const adminUser = {
          id: 'admin-user',
          email: email.toLowerCase(),
          name: email.split('@')[0],
          role: 'admin'
        };
        
        // Set user state
        setUser(adminUser);
        setIsAuthenticated(true);
        
        // Store auth data in localStorage
        localStorage.setItem('gabriel-auth-user', JSON.stringify(adminUser));
        localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
        localStorage.setItem('gabriel-auth-email', email.toLowerCase());
        localStorage.setItem('gabriel-user-role', 'admin');
        
        // Set cookies directly
        document.cookie = `gabriel-auth-token=admin-token; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = `gabriel-site-auth=true; path=/; max-age=${60 * 60 * 24 * 7}`;
        
        return { success: true };
      }
      
      // For other users, use NextAuth's signIn function directly
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      // If NextAuth succeeded
      if (!result?.error) {
        console.log('NextAuth login successful');
        setUser({ email, role: 'admin' }); // Assume admin role for direct login
        setIsAuthenticated(true);
        
        // Store auth data in localStorage
        localStorage.setItem('gabriel-auth-user', JSON.stringify({ email, role: 'admin' }));
        localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
        localStorage.setItem('gabriel-auth-email', email);
        localStorage.setItem('gabriel-user-role', 'admin'); // Set admin role directly
        
        return { success: true };
      }

      // If NextAuth failed, try fallback direct login API
      console.log('NextAuth login failed, trying direct login API');
      
      // Try direct login API as fallback
      const response = await fetch('/api/auth/direct-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      if (data.success) {
        // Set user state
        setUser(data.user || { email, role: 'admin' });
        setIsAuthenticated(true);
        
        // Store auth data in localStorage
        localStorage.setItem('gabriel-auth-user', JSON.stringify(data.user || { email, role: 'admin' }));
        localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
        localStorage.setItem('gabriel-auth-email', email);
        localStorage.setItem('gabriel-user-role', 'admin'); // Set admin role directly
        
        return { success: true };
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
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
