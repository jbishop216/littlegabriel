// Client-side wrapper component for admin page to handle authentication gracefully
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminDashboard from './AdminDashboard';

export default function AdminPageWrapper() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run this check when the session status is no longer loading
    if (status !== 'loading') {
      setIsLoading(false);
      
      // Check if user is logged in and is an admin
      if (!session || !session.user) {
        console.log('No session or user, redirecting to login');
        router.replace('/login?callbackUrl=/admin');
        setIsAuthorized(false);
        return;
      }
      
      const userRole = session.user.role || '';
      
      if (userRole !== 'admin') {
        console.log(`User role is not admin (${userRole}), redirecting to home`);
        router.replace('/');
        setIsAuthorized(false);
        return;
      }
      
      // User is authorized
      console.log('Client-side admin authentication successful for:', session.user.email);
      setIsAuthorized(true);
    }
  }, [session, status, router]);

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message briefly before redirect happens
  if (isAuthorized === false) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-amber-600 dark:text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render the admin dashboard if authorized
  if (isAuthorized) {
    return <AdminDashboard />;
  }

  // Default loading state
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Verifying access...</p>
      </div>
    </div>
  );
}
