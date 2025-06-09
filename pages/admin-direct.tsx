// This is a Pages Router page (not App Router)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { signIn, useSession } from 'next-auth/react';
import Head from 'next/head';

export default function AdminDirectPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // Redirect to login page if not authenticated
      router.push('/login?callbackUrl=/admin-direct');
    },
  });
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        // Skip if session is loading
        if (status === 'loading') {
          return; // Wait for session to load
        }

        // Check if the user is admin from the session
        if (session?.user?.role === 'admin') {
          console.log('User is admin according to session');
          setIsAdmin(true);
          setIsLoading(false);
          return;
        }

        // If we're here, we're authenticated but not admin according to session
        // Let's verify with the database directly
        const email = session?.user?.email;
        if (!email) {
          setError('No email in session');
          setIsLoading(false);
          return;
        }

        console.log('Checking admin status for:', email);
        
        // Direct check with the database via API
        const response = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        
        if (data.isAdmin) {
          console.log('User is admin according to database');
          setIsAdmin(true);
        } else {
          console.log('User is not admin according to database');
          setError('You do not have admin privileges');
          // Redirect to home after a short delay
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Error checking admin status');
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-700 dark:text-red-400">{error}</p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <Head>
          <title>Admin Dashboard | Little Gabriel</title>
          <meta name="description" content="Admin dashboard for Little Gabriel" />
        </Head>
        
        {/* Import Navbar and Footer from App Router */}
        <div className="flex min-h-screen flex-col">
          {/* We'll use a simplified header for the admin page */}
          <header className="bg-white shadow-sm dark:bg-gray-800">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <div className="flex items-center">
                <a href="/" className="flex items-center">
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Little Gabriel</span>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Logged in as: <span className="font-medium">{session?.user?.email}</span>
                </span>
                <button 
                  onClick={() => router.push('/')}
                  className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Back to Site
                </button>
              </div>
            </div>
          </header>
          
          <main className="flex-grow">
            <div className="container mx-auto px-4 py-8">
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
                    Admin status: <span className="font-medium">Active</span>
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
          </main>
          
          <footer className="bg-white py-4 shadow-inner dark:bg-gray-800">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>© {new Date().getFullYear()} Little Gabriel. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </>
    );
  }

  // Fallback - should never reach here due to redirects
  return null;
}
