'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePasswordContext } from '@/context/PasswordContext';
import { useSession } from 'next-auth/react';
import PasswordProtection from './PasswordProtection';

export function SiteProtectionWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePasswordContext();
  const { data: session } = useSession();
  const [isSiteProtected, setIsSiteProtected] = useState(false); // Start with false to prevent flash
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [hasDirectAuth, setHasDirectAuth] = useState(false);

  // Fix hydration issues by ensuring we only render once component is mounted client-side
  useEffect(() => {
    setMounted(true);
    
    // Check for direct authentication
    const authUser = localStorage.getItem('gabriel-auth-user');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        if (userData && userData.email) {
          setHasDirectAuth(true);
        }
      } catch (e) {
        console.error('Failed to parse auth user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Check if site protection is enabled
    const checkSiteProtection = async () => {
      try {
        // First check if site protection is disabled by environment variable
        // This is useful for development environments
        const devSettings = { siteProtected: true };
        
        try {
          // Check for the NEXT_PUBLIC_ environment variable (accessible in client)
          // This will be available if we've set it in next.config.js
          if (typeof process !== 'undefined' && 
              process.env.NEXT_PUBLIC_SITE_PASSWORD_PROTECTION === 'false') {
            console.log('Site protection disabled by environment variable');
            devSettings.siteProtected = false;
          }
        } catch (e) {
          console.log('Could not access env vars from client:', e);
        }
        
        // If not explicitly disabled, check API for setting
        if (devSettings.siteProtected) {
          const res = await fetch('/api/settings');
          const data = await res.json();
          setIsSiteProtected(data.siteProtected ?? true);
        } else {
          setIsSiteProtected(false);
        }
      } catch (error) {
        console.error('Failed to fetch site protection settings:', error);
        // Default to protected if we can't fetch the setting
        setIsSiteProtected(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) {
      checkSiteProtection();
    }
  }, [mounted]);

  // For debugging
  useEffect(() => {
    if (mounted) {
      console.log('Site protection status:', { 
        isAuthenticated,
        hasNextAuthSession: !!session,
        hasDirectAuth,
        isSiteProtected
      });
    }
  }, [mounted, isAuthenticated, session, hasDirectAuth, isSiteProtected]);

  // Always render children on the server to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Client-only code
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-2xl text-gray-700 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  // Allow access if either:
  // 1. User is authenticated through site-wide password OR
  // 2. User is logged in with NextAuth OR
  // 3. User is authenticated through our direct auth system
  if (isSiteProtected && !isAuthenticated && !session && !hasDirectAuth) {
    return <PasswordProtection />;
  }

  return <>{children}</>;
}