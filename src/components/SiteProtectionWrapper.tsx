'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePasswordContext } from '@/context/PasswordContext';
import { useSession } from 'next-auth/react';
import PasswordProtection from './PasswordProtection';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';

export function SiteProtectionWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated: isSitePasswordAuthenticated } = usePasswordContext();
  const { data: session } = useSession();
  const { isAuthenticated: isUserAuthenticated, isLoading: isAuthLoading } = useGlobalAuth();
  const [isSiteProtected, setIsSiteProtected] = useState(false); // Start with false to prevent flash
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration issues by ensuring we only render once component is mounted client-side
  useEffect(() => {
    setMounted(true);
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
        setIsSettingsLoading(false);
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
        isSitePasswordAuthenticated,
        hasNextAuthSession: !!session,
        isUserAuthenticated,
        isSiteProtected
      });
    }
  }, [mounted, isSitePasswordAuthenticated, session, isUserAuthenticated, isSiteProtected]);

  // Always render children on the server to avoid hydration mismatch
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Client-only code
  if (!mounted || isSettingsLoading || isAuthLoading) {
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
  if (isSiteProtected && !isSitePasswordAuthenticated && !session && !isUserAuthenticated) {
    return <PasswordProtection />;
  }

  return <>{children}</>;
}