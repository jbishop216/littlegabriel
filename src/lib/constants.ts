/**
 * Constants for the application
 * These values are used across the app and can be overridden by environment variables
 */

// The OpenAI Assistant ID - hard-coded as a fallback
// This is also available via environment variable OPENAI_ASSISTANT_ID
export const OPENAI_ASSISTANT_ID = 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

// Bible API configuration
export const BIBLE_API_BASE_URL = 'https://api.scripture.api.bible/v1';
export const DEFAULT_BIBLE_VERSION = 'ASV'; // American Standard Version
export const SUPPORTED_BIBLE_VERSIONS = ['ASV', 'KJV', 'WEB']; // Baptist-friendly versions

// Feature flags
export const ENABLE_DEBUG_LOGGING = process.env.NODE_ENV !== 'production';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';