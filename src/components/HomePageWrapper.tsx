'use client';

import LandingPage from './LandingPage';
import GlobalLayout from './GlobalLayout';
import BackgroundDecorator from './BackgroundDecorator';
import { useTheme } from '@/context/ThemeContext';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePageWrapper() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Handle redirect if user is authenticated and there's a redirectTo parameter
  useEffect(() => {
    const redirectTo = searchParams?.get('redirectTo');
    
    // If we have a session and a redirectTo parameter, redirect the user
    if (status === 'authenticated' && session && redirectTo) {
      console.log('Authenticated session found, redirecting to:', redirectTo);
      // Small timeout to ensure session is fully established
      setTimeout(() => {
        router.push(redirectTo);
      }, 300);
    }
  }, [session, status, searchParams, router]);
  
  // Explicitly apply the gradient based on theme - always use gold in the center
  const backgroundClass = isDarkMode 
    ? "bg-black" 
    : "bg-gradient-to-r from-blue-600 via-yellow-300 to-blue-600";
  
  return (
    <div className={`relative min-h-screen ${backgroundClass}`}>
      {/* Keeping BackgroundDecorator for the floating elements only */}
      <BackgroundDecorator skipBackground={true} />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <GlobalLayout>
          <LandingPage />
        </GlobalLayout>
      </div>
    </div>
  );
}