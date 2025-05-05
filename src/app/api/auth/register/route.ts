import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: formatZodErrors(validation.error) },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists (case-insensitive search)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        },
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user with normalized email
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail, // Always store email in lowercase
        password: hashedPassword,
        role: 'user', // Default role
      },
    });
    
    // Remove sensitive data before returning
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { message: 'User registered successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

function formatZodErrors(errors: any): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  for (const issue of errors.issues) {
    // Get the field name (path[0]) and the error message
    formattedErrors[issue.path[0]] = issue.message;
  }
  
  return formattedErrors;
}