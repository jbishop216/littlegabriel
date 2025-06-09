import { NextApiRequest, NextApiResponse } from 'next';

/**
 * This API route is deprecated in favor of the App Router version at:
 * src/app/api/auth/direct-login/route.ts
 * 
 * This file exists only to prevent conflicts and redirect to the new implementation.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set content type to ensure proper JSON response
  res.setHeader('Content-Type', 'application/json');
  
  // Inform about the deprecation
  return res.status(308).json({
    message: 'This API endpoint has been moved to the App Router implementation',
    redirectTo: '/api/auth/direct-login'
  });
}
