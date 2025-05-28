'use client';

import { useAuthPersistence } from '@/hooks/useAuthPersistence';

/**
 * This component doesn't render anything visible
 * It just ensures authentication state is properly managed across the application
 */
export default function AuthStateManager() {
  // Use our custom hook to ensure auth persistence
  useAuthPersistence();
  
  // This component doesn't render anything
  return null;
}
