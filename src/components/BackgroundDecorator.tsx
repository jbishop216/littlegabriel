'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';
import { CrossIcon, StarIcon, FIXED_POSITIONS, FIXED_DARK_MODE_POSITIONS } from './PageBackground';
import { getGradientForRoute, defaultGradient } from '@/lib/gradients';

// Import motion components dynamically to avoid hydration issues
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), {
  ssr: false
});

interface BackgroundDecoratorProps {
  /** Skip rendering the background, only render decorative elements */
  skipBackground?: boolean;
}

export default function BackgroundDecorator({ skipBackground = false }: BackgroundDecoratorProps) {
  // Use client-side only rendering for theme to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDarkMode = theme === 'dark';
  
  // Get the gradient for the current path, incorporating dark mode
  const gradient = pathname ? getGradientForRoute(pathname) : defaultGradient;
  
  // Use dark mode gradient if available and in dark mode
  const gradientClass = isDarkMode && gradient.darkClassName 
    ? gradient.darkClassName 
    : gradient.className;
  
  const itemPositions = isDarkMode ? FIXED_DARK_MODE_POSITIONS : FIXED_POSITIONS;
  
  // Enable client-side rendering after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Only log when running on client side
  useEffect(() => {
    if (isClient) {
      // For debugging
      console.log("Requested route:", pathname);
      console.log("Applied gradient:", isDarkMode ? gradient.darkClassName : gradient.className);
      console.log("Skip background:", skipBackground);
    }
  }, [isClient, pathname, isDarkMode, skipBackground, gradient]);

  // Use a static gradient background on server, then enhance on client
  if (!isClient) {
    return (
      !skipBackground ? (
        <div className={`fixed inset-0 z-0 ${isDarkMode ? (gradient.darkClassName || 'bg-black') : gradient.className}`} />
      ) : null
    );
  }

  return (
    <>
      {/* Full screen gradient background - only render if not skipped */}
      {!skipBackground && (
        <MotionDiv
          className={`fixed inset-0 z-0 ${isDarkMode ? (gradient.darkClassName || 'bg-black') : gradient.className}`}
          key={isDarkMode ? "dark-bg" : "light-bg"}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
      
      {/* Fixed position stars/crosses with improved z-index to ensure they're above background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        {itemPositions.map((position, index) => (
          <MotionDiv
            key={`${isDarkMode ? 'dark' : 'light'}-item-${index}-${isClient ? 'client' : 'server'}`}
            className="fixed"
            style={position}
            animate={{ 
              y: [0, -30, 0], 
              x: [0, 20, 0], 
              rotate: [0, isDarkMode ? 180 : 30, 0] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6 + index % 4, 
              repeatType: 'reverse' 
            }}
          >
            {isDarkMode ? (
              <StarIcon className={index % 2 === 0 ? "w-5 h-5 opacity-60" : "w-8 h-8 opacity-80"} />
            ) : (
              <CrossIcon className="w-10 h-10 opacity-80" />
            )}
          </MotionDiv>
        ))}
      </div>
    </>
  );
}