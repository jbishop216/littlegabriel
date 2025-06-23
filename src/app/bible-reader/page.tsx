// Skip static generation for this page to avoid Invalid URL errors
export const dynamic = 'force-dynamic';

import { lazy, Suspense } from 'react';

// Dynamically import the component with SSR disabled
const BibleReaderWithProviders = lazy(
  () => import('./BibleReaderWithProviders')
);

export default function BibleReaderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <BibleReaderWithProviders />
    </Suspense>
  );
}