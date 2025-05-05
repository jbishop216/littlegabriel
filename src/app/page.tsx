import { Metadata } from 'next';
import HomePageWrapper from '@/components/HomePageWrapper';

export const metadata: Metadata = {
  title: 'LittleGabriel - Faith-Based AI Counseling',
  description: 'A faith-based AI counseling application providing spiritual guidance and support.',
};

export default function Home() {
  return <HomePageWrapper />;
}