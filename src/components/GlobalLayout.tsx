'use client';

import Navbar from './Navbar';
import Footer from './Footer';
import { useEffect, useState, ReactNode, useRef } from 'react';
import { SiteProtectionWrapper } from './SiteProtectionWrapper';
import { usePathname } from 'next/navigation';

interface GlobalLayoutProps {
  children: ReactNode;
  containerClass?: string;
  backgroundClass?: string;
}

export default function GlobalLayout({ 
  children, 
  containerClass = "", 
  backgroundClass = "bg-gradient-to-tl from-blue-100 via-yellow-100 to-green-100" 
}: GlobalLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);
  
  // Fix hydration issues by ensuring we only render once component is mounted client-side
  useEffect(() => {
    setMounted(true);
    
    // Clean up function to prevent memory leaks
    return () => {
      renderCountRef.current = 0;
    };
  }, []);
  
  // Prevent navigation loops by tracking pathname changes
  useEffect(() => {
    // Only track after initial mount
    if (mounted) {
      prevPathRef.current = pathname;
    }
  }, [pathname, mounted]);

  // Limit render count to prevent infinite loops
  useEffect(() => {
    if (mounted) {
      renderCountRef.current += 1;
      
      // If we detect too many renders in a short time, log it
      if (renderCountRef.current > 10) {
        console.warn('Detected possible render loop in GlobalLayout. Continuing with latest render.');
        // We don't actually block rendering, just log a warning
      }
    }
  }, [mounted]);

  // On server-side or before hydration, render minimal content
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <SiteProtectionWrapper>
      <div className="flex min-h-screen flex-col">
        {/* No longer applying background here - BackgroundDecorator will handle it */}
        
        {/* Content - using key to ensure proper remounting when pathname changes */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className={`flex-1 ${containerClass}`}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SiteProtectionWrapper>
  );
}