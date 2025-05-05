'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface PasswordContextType {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean) => void;
}

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

export function PasswordProvider({ children }: { children: ReactNode }) {
  // Start with undefined to avoid hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Read from localStorage on initial load (client side only)
  useEffect(() => {
    try {
      const hasAuthenticated = localStorage.getItem('gabriel-site-auth') === 'true';
      setIsAuthenticated(hasAuthenticated);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setIsAuthenticated(false); // Fallback if localStorage fails
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Update localStorage when authentication state changes
  useEffect(() => {
    if (isInitialized && isAuthenticated !== null) {
      try {
        if (isAuthenticated) {
          localStorage.setItem('gabriel-site-auth', 'true');
        } else {
          localStorage.removeItem('gabriel-site-auth');
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
  }, [isAuthenticated, isInitialized]);

  // Cast isAuthenticated to boolean for components that use it before it's initialized
  // When null, treat as not authenticated
  return (
    <PasswordContext.Provider
      value={{
        isAuthenticated: isAuthenticated === null ? false : isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </PasswordContext.Provider>
  );
}

export function usePasswordContext() {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePasswordContext must be used within a PasswordProvider');
  }
  return context;
}