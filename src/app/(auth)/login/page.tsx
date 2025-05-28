'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { useDirectAuth } from '@/hooks/useDirectAuth';

// Component that uses searchParams - must be wrapped in Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const { data: session, status } = useSession();
  const { directLogin, isAuthenticated, isLoading: authLoading } = useDirectAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  // Check if user is already logged in via NextAuth or direct auth
  useEffect(() => {
    if ((session && status === 'authenticated') || isAuthenticated) {
      // User is authenticated, redirect to callback URL
      router.push(callbackUrl);
    }
  }, [session, status, isAuthenticated, callbackUrl, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoginStatus('Attempting to sign in...');
    setLoading(true);

    try {
      // First try our direct authentication approach
      const directResult = await directLogin(formData.email, formData.password);
      
      // Log direct auth response for debugging
      console.log('Direct authentication response:', directResult);
      
      if (directResult.success) {
        // Direct authentication succeeded
        setLoginStatus('Login successful via direct auth, redirecting...');
        
        // Store authentication in localStorage as backup
        try {
          localStorage.setItem('gabriel-site-auth', 'true');
          localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
          localStorage.setItem('gabriel-auth-email', formData.email);
        } catch (e) {
          console.error('Failed to set storage items', e);
        }
        
        // Give a moment for the session to be established
        setTimeout(() => {
          // Use router.push instead of window.location for smoother navigation
          router.push(callbackUrl || '/');
        }, 1000);
        return;
      }
      
      // If direct auth failed, fall back to NextAuth
      console.log('Falling back to NextAuth...');
      
      // Attempt to sign in with NextAuth credentials
      const localCallbackUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${callbackUrl}` 
        : callbackUrl;
      
      const res = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: localCallbackUrl,
      });
      
      // Log NextAuth response for debugging
      console.log('NextAuth response:', { 
        success: !res?.error,
        hasUrl: !!res?.url,
        error: res?.error,
        url: res?.url
      });

      if (res?.error) {
        // Both authentication methods failed
        setError(directResult.error || res.error);
      } else {
        // NextAuth succeeded
        setLoginStatus('Login successful via NextAuth, redirecting...');
        
        // Store authentication in localStorage as backup
        try {
          localStorage.setItem('gabriel-site-auth', 'true');
          localStorage.setItem('gabriel-auth-timestamp', Date.now().toString());
          localStorage.setItem('gabriel-auth-email', formData.email);
        } catch (e) {
          console.error('Failed to set storage items', e);
        }
        
        // Navigate to the callback URL
        setTimeout(() => {
          // Use router.push instead of window.location for smoother navigation
          router.push(callbackUrl || '/');
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      setError(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Log in to continue your faith journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Forgot Password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Your password"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loginStatus && !error && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {loginStatus}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Log in'}
        </Button>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Register
          </Link>
        </div>
      </form>
      
      {/* Social Login Buttons */}
      <SocialLoginButtons callbackUrl={callbackUrl} disabled={loading} />
    </div>
  );
}

// Loading fallback component
function LoginSkeleton() {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
      <div className="mb-6 text-center">
        <div className="h-7 w-1/2 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded mx-auto animate-pulse"></div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}