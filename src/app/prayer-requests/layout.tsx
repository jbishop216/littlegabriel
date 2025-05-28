import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prayer Requests - LittleGabriel',
  description: 'Submit and view prayer requests for community support and spiritual guidance',
};

export default function PrayerRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
