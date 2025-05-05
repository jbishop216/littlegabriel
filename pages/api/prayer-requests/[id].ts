import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for prayer request updates
const prayerRequestUpdateSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  content: z.string().min(10).max(1000).optional(),
  isAnonymous: z.boolean().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

// Helper function to format zod errors
function formatZodErrors(errors: any): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  for (const error of errors) {
    formattedErrors[error.path[0]] = error.message;
  }
  return formattedErrors;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get prayer request ID from route
  const id = req.query.id as string;
  
  // Check auth
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getPrayerRequest(id, session, res);
    case 'PATCH':
    case 'PUT':
      return updatePrayerRequest(id, req, session, res);
    case 'DELETE':
      return deletePrayerRequest(id, session, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Retrieve a specific prayer request
async function getPrayerRequest(id: string, session: any, res: NextApiResponse) {
  try {
    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!prayerRequest) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }
    
    const isAdmin = session.user.role === 'admin';
    const isOwner = prayerRequest.userId === session.user.id;
    
    // Check if user has permission to view this request
    if (!isAdmin && !isOwner && prayerRequest.status !== 'approved') {
      return res.status(403).json({ error: 'Not authorized to view this prayer request' });
    }
    
    // Respect anonymity
    if (prayerRequest.isAnonymous && !isOwner && !isAdmin) {
      return res.json({
        ...prayerRequest,
        userId: 'anonymous',
        user: {
          id: 'anonymous',
          name: 'Anonymous',
          email: null,
        },
      });
    }
    
    return res.json(prayerRequest);
  } catch (error) {
    console.error('Error fetching prayer request:', error);
    return res.status(500).json({ error: 'Failed to fetch prayer request' });
  }
}

// PATCH/PUT: Update a prayer request
async function updatePrayerRequest(
  id: string, 
  req: NextApiRequest, 
  session: any, 
  res: NextApiResponse
) {
  try {
    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id },
    });
    
    if (!prayerRequest) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }
    
    const isAdmin = session.user.role === 'admin';
    const isOwner = prayerRequest.userId === session.user.id;
    
    // Only owner or admin can update
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to update this prayer request' });
    }
    
    const data = req.body;
    
    // Validate request data
    const validationResult = prayerRequestUpdateSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errors = formatZodErrors(validationResult.error.errors);
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    // Only admin can update status
    if (data.status && !isAdmin) {
      return res.status(403).json({ error: 'Only admins can update prayer request status' });
    }
    
    // Update prayer request
    const updatedPrayerRequest = await prisma.prayerRequest.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        isAnonymous: data.isAnonymous,
        status: data.status,
      },
    });
    
    return res.json(updatedPrayerRequest);
  } catch (error) {
    console.error('Error updating prayer request:', error);
    return res.status(500).json({ error: 'Failed to update prayer request' });
  }
}

// DELETE: Delete a prayer request
async function deletePrayerRequest(id: string, session: any, res: NextApiResponse) {
  try {
    const prayerRequest = await prisma.prayerRequest.findUnique({
      where: { id },
    });
    
    if (!prayerRequest) {
      return res.status(404).json({ error: 'Prayer request not found' });
    }
    
    const isAdmin = session.user.role === 'admin';
    const isOwner = prayerRequest.userId === session.user.id;
    
    // Only owner or admin can delete
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this prayer request' });
    }
    
    // Delete prayer request
    await prisma.prayerRequest.delete({
      where: { id },
    });
    
    return res.json({ message: 'Prayer request deleted successfully' });
  } catch (error) {
    console.error('Error deleting prayer request:', error);
    return res.status(500).json({ error: 'Failed to delete prayer request' });
  }
}