'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useSession, signOut } from 'next-auth/react';
import { useGlobalAuth } from '@/hooks/useGlobalAuth';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { user, isAuthenticated, isLoading } = useGlobalAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);
  const navigationInProgressRef = useRef(false);

  // Close mobile menu when changing pages
  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      setMobileMenuOpen(false);
      prevPathRef.current = pathname;
    }
  }, [pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle navigation with debounce to prevent loops
  const handleNavigation = (href: string) => {
    // Skip if we're already navigating or trying to navigate to the current page
    if (navigationInProgressRef.current || href === pathname) {
      return;
    }

    navigationInProgressRef.current = true;
    
    // Reset the navigation flag after a short delay
    setTimeout(() => {
      navigationInProgressRef.current = false;
    }, 500);
  };

  const userIsAdmin = session?.user?.role === 'admin';

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Cross Logo */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="flex items-center gap-2" onClick={() => handleNavigation('/')}>
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                className="h-8 w-8 text-indigo-600 dark:text-indigo-400" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Vertical line from (12,2) down to (12,22) */}
                <path d="M12 2v20" />
                {/* Horizontal line from (6,10) to (18,10) */}
                <path d="M6 10h12" />
                {/* Optional: Small circle in center for elegance */}
                <circle cx="12" cy="10" r="1" fill="currentColor" />
              </svg>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                LittleGabriel
              </span>
            </Link>
          </div>
            
          {/* Navigation Links - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-2">
            <Link 
              href="/chat" 
              className={`inline-flex items-center px-3 py-2 rounded-md hover:bg-indigo-50 text-sm font-medium ${pathname === '/chat' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
              onClick={() => handleNavigation('/chat')}
              prefetch={false}
              passHref
            >
              <span>Chat</span>
            </Link>
            <Link 
              href="/prayer-requests" 
              className={`inline-flex items-center px-3 py-2 rounded-md hover:bg-indigo-50 text-sm font-medium ${pathname === '/prayer-requests' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
              onClick={() => handleNavigation('/prayer-requests')}
              prefetch={false} 
              passHref
            >
              <span>Prayer Requests</span>
            </Link>
            <Link 
              href="/sermon-generator" 
              className={`inline-flex items-center px-3 py-2 rounded-md hover:bg-indigo-50 text-sm font-medium ${pathname === '/sermon-generator' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
              onClick={() => handleNavigation('/sermon-generator')}
              prefetch={false}
              passHref
            >
              <span>Sermon Generator</span>
            </Link>
            <Link 
              href="/bible-reader" 
              className={`inline-flex items-center px-3 py-2 rounded-md hover:bg-indigo-50 text-sm font-medium ${pathname === '/bible-reader' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
              onClick={() => handleNavigation('/bible-reader')}
              prefetch={false}
              passHref
            >
              <span>Bible Study</span>
            </Link>
            {userIsAdmin && (
              <Link 
                href="/admin" 
                className={`inline-flex items-center px-3 py-2 rounded-md hover:bg-indigo-50 text-sm font-medium ${pathname === '/admin' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
                onClick={() => handleNavigation('/admin')}
                prefetch={false}
                passHref
              >
                <span className="flex items-center">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                  Admin Console
                </span>
              </Link>
            )}
          </div>

          {/* Right side elements */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* Login/Profile Button */}
            <div className="ml-auto flex items-center">
              <div className="hidden sm:ml-6 sm:flex sm:items-center">

                {/* Profile dropdown */}
                {!isLoading && isAuthenticated && user ? (
                  <div className="relative ml-4">
                    <div className="flex items-center">
                      <Link 
                        href="/profile" 
                        className="flex items-center rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                        onClick={() => handleNavigation('/profile')}
                        prefetch={false}
                        passHref
                      >
                        <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                        {user.email || 'Authenticated User'}
                      </Link>
                      <button
                        onClick={() => {
                          // Clear both NextAuth and direct auth
                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                          // Clear direct auth cookies and localStorage
                          if (typeof window !== 'undefined') {
                            localStorage.removeItem('gabriel-auth-user');
                            localStorage.removeItem('gabriel-auth-email');
                            localStorage.removeItem('gabriel-auth-timestamp');
                            localStorage.removeItem('gabriel-auth-token');
                            // Set cookies to expire
                            document.cookie = 'gabriel-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                            document.cookie = 'gabriel-site-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                          }
                          // Also sign out from NextAuth
                          signOut({ callbackUrl: `${baseUrl}/` });
                        }}
                        className="ml-2 rounded-md border border-gray-300 bg-white p-1.5 text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        aria-label="Sign out"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link 
                      href="/login" 
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => handleNavigation('/login')}
                      prefetch={false}
                      passHref
                    >
                      Log in
                    </Link>
                    <Link 
                      href="/register" 
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      onClick={() => handleNavigation('/register')}
                      prefetch={false}
                      passHref
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
      >
        <div className="space-y-1 pb-3 pt-2">
          <Link 
            href="/chat" 
            className={`block py-2 px-4 mb-1 text-base font-medium rounded-md ${pathname === '/chat' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
            onClick={() => {
              handleNavigation('/chat');
              setMobileMenuOpen(false);
            }}
            prefetch={false}
            passHref
          >
            <span>Chat</span>
          </Link>
          <Link 
            href="/prayer-requests" 
            className={`block py-2 px-4 mb-1 text-base font-medium rounded-md ${pathname === '/prayer-requests' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
            onClick={() => {
              handleNavigation('/prayer-requests');
              setMobileMenuOpen(false);
            }}
            prefetch={false}
            passHref
          >
            <span>Prayer Requests</span>
          </Link>
          <Link 
            href="/sermon-generator" 
            className={`block py-2 px-4 mb-1 text-base font-medium rounded-md ${pathname === '/sermon-generator' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
            onClick={() => {
              handleNavigation('/sermon-generator');
              setMobileMenuOpen(false);
            }}
            prefetch={false}
            passHref
          >
            <span>Sermon Generator</span>
          </Link>
          <Link 
            href="/bible-reader" 
            className={`block py-2 px-4 mb-1 text-base font-medium rounded-md ${pathname === '/bible-reader' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
            onClick={() => {
              handleNavigation('/bible-reader');
              setMobileMenuOpen(false);
            }}
            prefetch={false}
            passHref
          >
            <span>Bible Study</span>
          </Link>
          {userIsAdmin && (
            <Link 
              href="/admin" 
              className={`block py-2 px-4 mb-1 text-base font-medium rounded-md ${pathname === '/admin' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'} hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors`}
              onClick={() => {
                handleNavigation('/admin');
                setMobileMenuOpen(false);
              }}
              prefetch={false}
              passHref
            >
              <span className="flex items-center">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
                Admin Console
              </span>
            </Link>
          )}
        </div>
        <div className="border-t border-gray-200 pb-3 pt-4 dark:border-gray-700">
          <div className="flex items-center px-4">
            {!isLoading && isAuthenticated && user ? (
              <div className="w-full">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {user.email || 'Authenticated User'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.role || 'User'}
                </div>
                <div className="mt-3 flex flex-col space-y-3">
                  <button
                    onClick={toggleTheme}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                  <button
                    onClick={() => {
                      // Clear both NextAuth and direct auth
                      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                      // Clear direct auth cookies and localStorage
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('gabriel-auth-user');
                        localStorage.removeItem('gabriel-auth-email');
                        localStorage.removeItem('gabriel-auth-timestamp');
                        localStorage.removeItem('gabriel-auth-token');
                        // Set cookies to expire
                        document.cookie = 'gabriel-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                        document.cookie = 'gabriel-site-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                      }
                      // Also sign out from NextAuth
                      signOut({ callbackUrl: `${baseUrl}/` });
                    }}
                    className="block rounded-md border border-gray-300 bg-white px-3 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <button
                  onClick={toggleTheme}
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className="mt-3 flex space-x-2">
                  <Link 
                    href="/login" 
                    className="flex-1" 
                    onClick={() => {
                      handleNavigation('/login');
                      setMobileMenuOpen(false);
                    }}
                    prefetch={false}
                    passHref
                  >
                    <button className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                      Log in
                    </button>
                  </Link>
                  <Link 
                    href="/register" 
                    className="flex-1" 
                    onClick={() => {
                      handleNavigation('/register');
                      setMobileMenuOpen(false);
                    }}
                    prefetch={false}
                    passHref
                  >
                    <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-center text-base font-medium text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                      Register
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}