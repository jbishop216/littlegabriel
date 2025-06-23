import { Metadata } from 'next';
import HomePageWrapper from '@/components/HomePageWrapper';

// Skip static generation for this page to avoid Invalid URL errors
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LittleGabriel - Faith-Based AI Counseling',
  description: 'A faith-based AI counseling application providing spiritual guidance and support.',
};

export default function Home() {
  return <HomePageWrapper />;
}