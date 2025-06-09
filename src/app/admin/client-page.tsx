'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminClientPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for admin status from multiple sources
    const checkAdminStatus = () => {
      try {
        // Check session first
        if (session?.user?.role === 'admin') {
          setIsAdmin(true);
          setEmail(session.user.email || null);
          setIsLoading(false);
          return;
        }

        // Check localStorage
        const localStorageRole = localStorage.getItem('gabriel-user-role');
        const localStorageEmail = localStorage.getItem('gabriel-auth-email');
        const localStorageUser = localStorage.getItem('gabriel-auth-user');
        
        if (localStorageRole === 'admin') {
          setIsAdmin(true);
          setEmail(localStorageEmail || (localStorageUser ? JSON.parse(localStorageUser).email : null));
          setIsLoading(false);
          return;
        }

        // If we're here and session is loaded but no admin, redirect
        if (status !== 'loading') {
          setIsLoading(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsLoading(false);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session, status, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <span className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</span>
        </div>
      </div>
    );
  }

  // User is not admin, show error
  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-8">
        <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/30">
          <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">Access Denied</h2>
          <p className="text-red-600 dark:text-red-300">
            You do not have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // User is admin, show dashboard
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
            Logged in as Admin: <span className="font-medium">{email}</span>
          </span>
        </div>
      </div>
      
      <AdminDashboard />
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Some admin dashboard features are currently under development. Check back soon for updates.
        </p>
      </div>
    </div>
  );
}
