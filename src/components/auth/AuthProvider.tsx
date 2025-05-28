'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Handle session restoration from localStorage if needed
  useEffect(() => {
    setMounted(true);
    
    // Check if we have a localStorage backup of authentication
    const hasLocalAuth = typeof window !== 'undefined' && localStorage.getItem('gabriel-site-auth') === 'true';
    const authTimestamp = typeof window !== 'undefined' ? localStorage.getItem('gabriel-auth-timestamp') : null;
    const isAuthFresh = authTimestamp && (Date.now() - parseInt(authTimestamp)) < 24 * 60 * 60 * 1000; // 24 hours
    
    // Log auth state for debugging
    if (typeof window !== 'undefined') {
      console.log('Auth Provider Mounted', { 
        hasLocalAuth, 
        authTimestamp,
        isAuthFresh,
        pathname
      });
    }
  }, [pathname, router]);

  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
