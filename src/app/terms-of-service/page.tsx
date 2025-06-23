// Skip static generation for this page to avoid Invalid URL errors
export const dynamic = 'force-dynamic';

import { lazy, Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | LittleGabriel',
  description: 'Terms of Service for LittleGabriel - Our agreement with you regarding use of our platform.',
};

// Dynamically import the component with SSR disabled
const TermsOfServiceWithProviders = lazy(
  () => import('./TermsOfServiceWithProviders')
);

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <TermsOfServiceWithProviders />
    </Suspense>
  );
}
