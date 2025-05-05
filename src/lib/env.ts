/**
 * Environment Variable Management
 * 
 * This module provides a centralized way to access environment variables
 * with proper fallbacks and validation for consistent behavior
 * between development and production environments.
 */

// Improve environment variable access with direct process.env accesses
// This ensures we're always getting the freshest values, even when environments
// might have changed after this module was initially loaded

// Standard environment variables with defaults
export const ENV = {
  // Node environment
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get IS_PRODUCTION() { return process.env.NODE_ENV === 'production'; },
  get IS_DEVELOPMENT() { return process.env.NODE_ENV !== 'production'; },
  
  // OpenAI configuration
  get OPENAI_API_KEY() { return process.env.OPENAI_API_KEY || ''; },
  get OPENAI_ASSISTANT_ID() { 
    return process.env.OPENAI_ASSISTANT_ID || 
           process.env.ASSISTANT_ID || 
           'asst_BpFiJmyhoHFYUj5ooLEoHEX2'; 
  },
  get ASSISTANT_ID() { 
    return process.env.ASSISTANT_ID || 
           process.env.OPENAI_ASSISTANT_ID || 
           'asst_BpFiJmyhoHFYUj5ooLEoHEX2'; 
  },
  
  // Auth configuration
  get NEXTAUTH_URL() { return process.env.NEXTAUTH_URL || 'http://localhost:5000'; },
  get NEXTAUTH_SECRET() { return process.env.NEXTAUTH_SECRET || 'development-secret-not-for-production'; },
  
  // Database
  get DATABASE_URL() { return process.env.DATABASE_URL || ''; },
  
  // API URLs
  get API_BASE_URL() { return process.env.NEXT_PUBLIC_API_BASE_URL || ''; },

  // Helper method to get any environment variable with a fallback
  getEnv(name: string, fallback = '') {
    return process.env[name] || fallback;
  }
};

/**
 * Validate that required environment variables are present
 * Returns an array of missing required variables, empty if all are present
 */
export function validateRequiredEnvVars(): string[] {
  const required = ['OPENAI_API_KEY'];
  return required.filter(key => !ENV[key as keyof typeof ENV]);
}

/**
 * Check if a specific environment variable exists
 */
export function hasEnvVar(name: string): boolean {
  return !!process.env[name];
}

/**
 * Get an environment variable with a fallback
 */
export function getEnvVar(name: string, fallback: string = ''): string {
  return process.env[name] || fallback;
}

/**
 * Logs environment configuration (sanitized)
 * Safe to use in both development and production
 * Only logs the first 4 characters of sensitive values
 */
export function logEnvironment(forceLog: boolean = false): void {
  // In production, only log if explicitly requested with forceLog
  // This prevents accidental exposure of sensitive data in logs
  if (ENV.IS_PRODUCTION && !forceLog) {
    console.log('Environment logging skipped in production. Set forceLog=true to override.');
    return;
  }
  
  try {
    // Use direct process.env access for most up-to-date values
    const apiKey = process.env.OPENAI_API_KEY || ENV.OPENAI_API_KEY || '';
    const assistantId = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || ENV.OPENAI_ASSISTANT_ID;
    
    const sanitized = {
      NODE_ENV: process.env.NODE_ENV || ENV.NODE_ENV,
      OPENAI_API_KEY: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.length}` : 'not set',
      OPENAI_ASSISTANT_ID: assistantId,
      ASSISTANT_ID: process.env.ASSISTANT_ID || 'not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || ENV.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '********' : 'not set',
      DATABASE_URL: process.env.DATABASE_URL ? '********' : 'not set',
    };
    
    console.log('\n🔑 Environment Configuration:', sanitized);
  } catch (error) {
    console.error('Error logging environment:', error);
  }
}
