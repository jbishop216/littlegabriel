'use client';

import { ReactNode } from 'react';
import AuthProvider from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/context/ThemeContext';
import { PasswordProvider } from '@/context/PasswordContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PasswordProvider>
          {children}
        </PasswordProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}