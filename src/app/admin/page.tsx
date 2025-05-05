import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Console - LittleGabriel',
  description: 'Administration console for managing users, analytics, and prayer requests',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if no session or if user is not an admin
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }
  
  if (session.user.role !== 'admin') {
    redirect('/');
  }
  
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md dark:from-purple-600 dark:to-indigo-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Console</h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Manage users, view analytics, and approve prayer requests.
        </p>
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span>
            Logged in as Admin: <span className="font-medium">{session.user.email}</span>
          </span>
        </div>
      </div>
      
      {/* Admin Dashboard */}
      <AdminDashboard />
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Some admin dashboard features are currently under development. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}