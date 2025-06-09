import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Admin Console - LittleGabriel',
  description: 'Administration console for managing users, analytics, and prayer requests',
};

import AdminClientPage from './client-page';

export default function AdminPage() {
  return <AdminClientPage />;
}