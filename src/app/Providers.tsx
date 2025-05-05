'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/context/ThemeContext';
import { PasswordProvider } from '@/context/PasswordContext';

export function Providers({ children }: { children: ReactNode }) {
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