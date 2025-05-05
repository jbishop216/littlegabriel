import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import PrayerRequestsClient from './prayer-requests-client';

// Exported server component metadata
export const metadata: Metadata = {
  title: 'Prayer Requests - LittleGabriel',
  description: 'Submit and view prayer requests for community support and spiritual guidance',
};

export default async function PrayerRequestsPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if no session
  if (!session?.user) {
    redirect('/login?callbackUrl=/prayer-requests');
  }
  
  return <PrayerRequestsClient session={session} />;
}