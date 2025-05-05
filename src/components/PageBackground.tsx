'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useMemo, Suspense } from 'react';
import { getGradientForRoute, defaultGradient } from '@/lib/gradients';
import { useTheme } from '@/context/ThemeContext';

interface CrossIconProps {
  className?: string;
}

export function CrossIcon({ className }: CrossIconProps) {
  return (
    <svg
      width="40"
      height="40"
      fill="none"
      stroke="white"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Vertical line from (12,2) down to (12,18) */}
      <path d="M12 2v16" />
      {/* Horizontal line from (8,8) to (16,8) */}
      <path d="M8 8h8" />
    </svg>
  );
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      fill="white"
      stroke="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
    </svg>
  );
}

// Fixed positions array for consistency across the site
export const FIXED_POSITIONS = [
  { top: '10%', left: '10%' },
  { top: '25%', left: '80%' },
  { top: '50%', left: '15%' },
  { top: '75%', left: '70%' },
  { top: '20%', left: '40%' },
  { top: '60%', left: '30%' },
  { top: '80%', left: '20%' },
  { top: '40%', left: '90%' },
];

// Fixed dark mode positions
export const FIXED_DARK_MODE_POSITIONS = [
  ...FIXED_POSITIONS,
  { top: '15%', left: '65%' },
  { top: '35%', left: '25%' },
  { top: '55%', left: '60%' },
  { top: '85%', left: '45%' },
];

// Component that uses usePathname inside Suspense
function BackgroundContent() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Get the gradient for the current path, incorporating dark mode
  const gradient = pathname ? getGradientForRoute(pathname) : defaultGradient;
  
  // Use dark mode gradient if available and in dark mode
  const gradientClass = isDarkMode && gradient.darkClassName 
    ? gradient.darkClassName 
    : gradient.className;
  
  const itemPositions = isDarkMode ? FIXED_DARK_MODE_POSITIONS : FIXED_POSITIONS;

  return (
    <>
      {/* Gradient background with appropriate colors for the theme */}
      <motion.div
        className={`fixed inset-0 z-0 ${gradientClass}`}
        key={isDarkMode ? 'dark-bg' : 'light-bg'} // Force re-render on theme change
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Import the shared background decorator for consistent stars/crosses */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {itemPositions.map((position, index) => (
          <motion.div
            key={`${isDarkMode ? 'dark' : 'light'}-item-${index}`}
            className="fixed z-0"
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
          </motion.div>
        ))}
      </div>
    </>
  );
}

// Main component with Suspense boundary
export default function PageBackground() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Use the dark mode fallback if available
  const fallbackGradient = isDarkMode && defaultGradient.darkClassName 
    ? defaultGradient.darkClassName 
    : defaultGradient.className;
    
  return (
    <Suspense fallback={
      <div className={`fixed inset-0 z-0 ${fallbackGradient}`}></div>
    }>
      <BackgroundContent />
    </Suspense>
  );
}