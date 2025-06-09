import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(req, res, authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated', isAdmin: false });
    }

    // Get the email from the request body or from the session
    const { email } = req.body.email ? req.body : { email: session.user.email };
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required', isAdmin: false });
    }

    console.log('Checking admin status for email:', email);

    // Find the user with case-insensitive email match
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found', isAdmin: false });
    }

    // Check if the user is an admin
    const isAdmin = user.role === 'admin';
    
    console.log('User admin status:', { email: user.email, role: user.role, isAdmin });

    // Return the admin status
    return res.status(200).json({ 
      isAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ error: 'Internal server error', isAdmin: false });
  }
}
