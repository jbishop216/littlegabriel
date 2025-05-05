'use client';  // Need this for framer-motion animations

import LandingPage from '@/components/LandingPage';
import { SiteProtectionWrapper } from './SiteProtectionWrapper';
import Navbar from './Navbar';
import Footer from './Footer';

export default function HomePage() {
  return (
    <SiteProtectionWrapper>
      <div className="relative flex min-h-screen flex-col">
        <div className="fixed inset-0 z-0 bg-gradient-to-tl from-blue-100 via-yellow-100 to-green-100"></div>
        
        {/* Content */}
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            {/* Home Page Content */}
            <div className="relative min-h-screen overflow-hidden">
              <div className="relative z-10">
                <LandingPage />
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </SiteProtectionWrapper>
  );
}