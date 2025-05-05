'use client';

import LandingPage from './LandingPage';
import GlobalLayout from './GlobalLayout';
import BackgroundDecorator from './BackgroundDecorator';
import { useTheme } from '@/context/ThemeContext';

export default function HomePageWrapper() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
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