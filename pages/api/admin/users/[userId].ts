import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get user ID from route
  const userId = req.query.userId as string;
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getUserById(userId, res);
    case 'PUT':
      return updateUser(userId, req, res);
    case 'DELETE':
      return deleteUser(userId, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Retrieve a single user by ID
async function getUserById(userId: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

// PUT: Update a user by ID
async function updateUser(userId: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role,
        // Add other fields as needed
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

// DELETE: Remove a user by ID
async function deleteUser(userId: string, res: NextApiResponse) {
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}