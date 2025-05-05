'use client';

import dynamic from 'next/dynamic';

// Import the LittleGabrielLanding component with dynamic import to avoid SSR issues with framer-motion
const LittleGabrielLanding = dynamic(() => import('@/components/LittleGabrielLanding'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-white"></div>
        <p className="mt-4 text-xl font-bold text-white">Loading LittleGabriel...</p>
      </div>
    </div>
  ),
});

export default function LandingPage() {
  // Just render the content, let the page.tsx handle the background
  return <LittleGabrielLanding />;
}