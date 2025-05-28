import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sermon Generator - LittleGabriel',
  description: 'Generate sermon outlines and inspiration for your congregation',
};

export default function SermonGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
