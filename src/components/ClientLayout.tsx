'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { PasswordProvider } from '@/context/PasswordContext';
import { SessionProvider } from '@/components/SessionProvider';
import { SiteProtectionWrapper } from './SiteProtectionWrapper';
import PageBackground from './PageBackground';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PasswordProvider>
          <SiteProtectionWrapper>
            <div className="relative flex min-h-screen flex-col">
              {/* Page-specific gradient background with floating crosses */}
              <PageBackground />
              
              {/* Content */}
              <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </div>
          </SiteProtectionWrapper>
        </PasswordProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}