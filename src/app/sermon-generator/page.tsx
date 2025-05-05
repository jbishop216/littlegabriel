import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SermonGeneratorClient from './sermon-generator-client';

export const metadata: Metadata = {
  title: 'Sermon Generator - LittleGabriel',
  description: 'Generate sermon outlines and inspiration for your congregation',
};

export default async function SermonGeneratorPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if no session
  if (!session?.user) {
    redirect('/login?callbackUrl=/sermon-generator');
  }
  
  return <SermonGeneratorClient />;
}