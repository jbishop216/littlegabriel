'use client';

import { useTheme } from '@/context/ThemeContext';

interface ThemeIconProps {
  className?: string;
}

export function FloatingIcon({ className }: ThemeIconProps) {
  const { theme } = useTheme();
  
  if (theme === 'dark') {
    return <StarIcon className={className} />;
  }
  
  return <CrossIcon className={className} />;
}

// Cross SVG component for light mode
export function CrossIcon({ className }: { className?: string }) {
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
      <path d="M12 2v16" />
      <path d="M8 8h8" />
    </svg>
  );
}

// Star SVG component for dark mode
export function StarIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}