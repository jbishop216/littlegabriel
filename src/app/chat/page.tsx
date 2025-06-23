// Skip static generation for this page to avoid useSession SSR errors
export const dynamic = 'force-dynamic';

import { lazy, Suspense } from 'react';
import { Metadata } from 'next';

// Lazy load the chat component with providers
const ChatWithProviders = lazy(() => import('./ChatWithProviders'));

export const metadata: Metadata = {
  title: 'Chat with Gabriel',
  description: 'Have a faithful conversation with our AI assistant',
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ChatWithProviders />
    </Suspense>
  );
}