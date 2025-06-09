import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // This is a special endpoint to promote a specific user to admin
    // In production, this should be more secure with proper authentication
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email (case insensitive)
    // Using toLowerCase() for case insensitive comparison
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: email.toLowerCase(),
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user role to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `User ${updatedUser.email} has been promoted to admin`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return res.status(500).json({ error: 'Failed to promote user to admin' });
  }
}
