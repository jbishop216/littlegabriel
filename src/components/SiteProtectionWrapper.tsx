'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePasswordContext } from '@/context/PasswordContext';
import PasswordProtection from './PasswordProtection';

export function SiteProtectionWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePasswordContext();
  const [isSiteProtected, setIsSiteProtected] = useState(false); // Start with false to prevent flash
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues by ensuring we only render once component is mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if site protection is enabled
    const checkSiteProtection = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setIsSiteProtected(data.siteProtected ?? true);
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

  // If the site is protected and the user is not authenticated
  if (isSiteProtected && !isAuthenticated) {
    return <PasswordProtection />;
  }

  return <>{children}</>;
}