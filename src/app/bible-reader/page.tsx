'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { PasswordProvider } from '@/context/PasswordContext';
import { SessionProvider } from '@/components/SessionProvider';
import BibleReaderClient from './BibleReaderClient';
import { metadata } from './metadata';

export default function BibleReaderPage() {
  return (
    <SessionProvider>
      <ThemeProvider>
        <PasswordProvider>
          <BibleReaderClient />
        </PasswordProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}