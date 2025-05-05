'use client';

import { SessionProvider } from '@/components/SessionProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { PasswordProvider } from '@/context/PasswordContext';

export default function LayoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PasswordProvider>
          {children}
        </PasswordProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}