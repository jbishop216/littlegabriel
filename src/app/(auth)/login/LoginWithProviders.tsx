'use client';

import { SessionProvider } from '@/components/SessionProvider';
import LoginForm from './LoginForm';

export default function LoginWithProviders() {
  return (
    <SessionProvider>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoginForm />
      </div>
    </SessionProvider>
  );
}
