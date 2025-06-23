'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // Use a safe SSR approach to prevent Invalid URL errors
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Always use SessionProvider, but with different configurations based on rendering context
  const router = useRouter();
  const pathname = usePathname();
  
  // Handle session restoration from localStorage if needed (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we have a localStorage backup of authentication
    const hasLocalAuth = localStorage.getItem('gabriel-site-auth') === 'true';
    const authTimestamp = localStorage.getItem('gabriel-auth-timestamp');
    const isAuthFresh = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 24 * 60 * 60 * 1000; // 24 hours
    
    // Log auth state for debugging
    console.log('Auth Provider Mounted', { 
      hasLocalAuth, 
      authTimestamp,
      isAuthFresh,
      pathname
    });
  }, [pathname, router]);

  // For SSR, use a basic SessionProvider without refetch options
  if (!mounted && typeof window === 'undefined') {
    return (
      <SessionProvider>
        {children}
      </SessionProvider>
    );
  }
  
  // For client-side, use full SessionProvider with refetch options
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
