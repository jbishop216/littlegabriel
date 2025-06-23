// Skip static generation for this page to avoid Invalid URL errors
export const dynamic = 'force-dynamic';

import { lazy, Suspense } from 'react';

// Dynamically import the component with SSR disabled
const SermonGeneratorWithProviders = lazy(
  () => import('./SermonGeneratorWithProviders')
);

export default function SermonGeneratorPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <SermonGeneratorWithProviders />
    </Suspense>
  );
}