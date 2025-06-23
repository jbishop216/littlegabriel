import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for prayer request validation
const prayerRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(1000, 'Content cannot exceed 1000 characters'),
  isAnonymous: z.boolean().optional(),
});

// Helper function to format zod errors
function formatZodErrors(errors: any): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  for (const error of errors) {
    formattedErrors[error.path[0]] = error.message;
  }
  return formattedErrors;
}

// GET: Retrieve prayer requests
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Safe URL parsing with fallback for build-time
    let searchParams;
    try {
      searchParams = new URL(req.url).searchParams;
    } catch (e) {
      // During build/SSG, req.url might not be a valid URL
      // Provide fallback values for SSG
      searchParams = new URLSearchParams();
    }
    const status = searchParams.get('status');
    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    // Query parameters
    const queryOptions: any = {};
    
    // Filter by status if provided
    if (status) {
      queryOptions.where = {
        ...(queryOptions.where || {}),
        status,
      };
    }
    
    // If not admin, only show approved requests (unless they're the user's own)
    if (!isAdmin) {
      queryOptions.where = {
        ...(queryOptions.where || {}),
        OR: [
          { userId }, // User's own requests
          { status: 'approved' }, // Approved requests from any user
        ],
      };
    }
    
    // Include user information but protect anonymous requests
    queryOptions.include = {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };
    
    // Order by most recent
    queryOptions.orderBy = {
      createdAt: 'desc',
    };
    
    const prayerRequests = await prisma.prayerRequest.findMany(queryOptions);
    
    // Process to respect anonymity
    const processedRequests = prayerRequests.map(request => {
      if (request.isAnonymous && request.userId !== userId) {
        return {
          ...request,
          userId: 'anonymous',
          user: {
            id: 'anonymous',
            name: 'Anonymous',
            email: null,
          },
        };
      }
      return request;
    });
    
    return NextResponse.json(processedRequests);
  } catch (error) {
    console.error('Error fetching prayer requests:', error);
    return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 });
  }
}

// POST: Create a new prayer request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // Validate request data
    const validationResult = prayerRequestSchema.safeParse(data);
    
    if (!validationResult.success) {
      const errors = formatZodErrors(validationResult.error.errors);
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }
    
    // Create prayer request
    const prayerRequest = await prisma.prayerRequest.create({
      data: {
        title: data.title,
        content: data.content,
        isAnonymous: data.isAnonymous || false,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(prayerRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating prayer request:', error);
    return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
  }
}