'use client';

import { useState, FormEvent } from 'react';
import { usePasswordContext } from '@/context/PasswordContext';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function PasswordProtection() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsAuthenticated } = usePasswordContext();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/site-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      const { isValid } = data;
      
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify password:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Site Password Protected
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please enter the password to access this site
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter site password"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Verifying...' : 'Access Site'}
          </Button>
        </form>
      </div>
    </div>
  );
}