// Page-specific gradient configurations
// Light mode uses a golden/yellow center with different complementary colors on the sides
// Dark mode uses deep blues and indigos with a starry theme
// Avoiding purple, pink, and red as requested

type GradientConfig = {
  from: string;
  via: string;
  to: string;
  className: string;
  darkClassName?: string; // Optional dark mode class name
};

// Default gradient with gold center and blue edges (light mode)
// And deep blues (dark mode)
export const defaultGradient: GradientConfig = {
  from: 'from-blue-500',
  via: 'via-yellow-300',
  to: 'to-blue-500',
  className: 'bg-gradient-to-r from-blue-500 via-yellow-300 to-blue-500',
  darkClassName: 'bg-black'  // Pure black for dark mode
};

// Mapping of page routes to their specific gradient configuration
const gradientMap: Record<string, GradientConfig> = {
  // Homepage - blue → gold → blue (default)
  '/': defaultGradient,
  
  // Chat page - teal → gold → teal (light) or pure black (dark)
  '/chat': {
    from: 'from-teal-500',
    via: 'via-yellow-300',
    to: 'to-teal-500',
    className: 'bg-gradient-to-r from-teal-500 via-yellow-300 to-teal-500',
    darkClassName: 'bg-black'
  },
  
  // Bible Reader page - green → gold → green (light) or pure black (dark)
  '/bible-reader': {
    from: 'from-green-600',
    via: 'via-yellow-300',
    to: 'to-green-600',
    className: 'bg-gradient-to-r from-green-600 via-yellow-300 to-green-600',
    darkClassName: 'bg-black'
  },
  
  // Prayer Requests page - cyan → gold → cyan (light) or pure black (dark)
  '/prayer-requests': {
    from: 'from-cyan-500',
    via: 'via-yellow-300',
    to: 'to-cyan-500',
    className: 'bg-gradient-to-r from-cyan-500 via-yellow-300 to-cyan-500',
    darkClassName: 'bg-black'
  },
  
  // Sermon Generator page - indigo → gold → indigo (light) or pure black (dark)
  '/sermon-generator': {
    from: 'from-indigo-500',
    via: 'via-yellow-300',
    to: 'to-indigo-500',
    className: 'bg-gradient-to-r from-indigo-500 via-yellow-300 to-indigo-500',
    darkClassName: 'bg-black'
  },
  
  // Admin page - slate → gold → slate (light) or pure black (dark)
  '/admin': {
    from: 'from-slate-600',
    via: 'via-yellow-300',
    to: 'to-slate-600',
    className: 'bg-gradient-to-r from-slate-600 via-yellow-300 to-slate-600',
    darkClassName: 'bg-black'
  },

  // Privacy Policy and Terms of Service
  '/privacy-policy': {
    from: 'from-blue-500',
    via: 'via-yellow-300',
    to: 'to-blue-500',
    className: 'bg-gradient-to-r from-blue-500 via-yellow-300 to-blue-500',
    darkClassName: 'bg-black'
  },
  
  '/terms-of-service': {
    from: 'from-blue-500',
    via: 'via-yellow-300',
    to: 'to-blue-500',
    className: 'bg-gradient-to-r from-blue-500 via-yellow-300 to-blue-500',
    darkClassName: 'bg-black'
  }
};

/**
 * Get the gradient configuration for a specific route
 * @param route The current route path (e.g., '/chat', '/bible-reader')
 * @returns The gradient configuration for the route, or the default if not found
 */
export function getGradientForRoute(route: string | null): GradientConfig {
  // Enhanced logging for debugging route matching issues
  console.log("Requested route:", route);
  console.log("Available routes:", Object.keys(gradientMap));
  
  // Normalize the route by ensuring it starts with '/'
  let normalizedRoute = route;
  if (normalizedRoute && !normalizedRoute.startsWith('/')) {
    normalizedRoute = '/' + normalizedRoute;
  }
  
  // Basic route matching - check for exact match first
  if (normalizedRoute && normalizedRoute in gradientMap) {
    console.log("Found exact match for route:", normalizedRoute);
    return gradientMap[normalizedRoute];
  }
  
  // Handle root route specially
  if (normalizedRoute === '/' || normalizedRoute === '') {
    console.log("Using home route gradient (root path)");
    return gradientMap['/'];
  }
  
  // Fallback to default gradient
  console.log("No matching gradient found, using default");
  return defaultGradient;
}