/**
 * Final Deployment Fix Script
 * 
 * This script addresses ALL the issues preventing successful deployment:
 * 1. Creates correct _document.js files in all required locations
 * 2. Fixes the admin users route TypeScript errors
 * 3. Ensures NextAuth route handler is properly implemented
 * 4. Updates Next.js configuration to remove deprecated settings
 */

const fs = require('fs');
const path = require('path');

// Ensure directory exists
function ensureDir(dirPath) {
  const parts = dirPath.split('/');
  let currentPath = '';
  
  parts.forEach(part => {
    currentPath = path.join(currentPath, part);
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
}

// Write file with content, creating directories if needed
function writeFile(filePath, content) {
  const dirPath = path.dirname(filePath);
  ensureDir(dirPath);
  fs.writeFileSync(filePath, content);
  console.log(`Created/updated file: ${filePath}`);
}

// Fix 1: Create _document.js files in all required locations
console.log('🚀 Starting comprehensive deployment fix script...');

console.log('\n🔧 Creating all required _document.js files...');
const documentContent = `import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="application-name" content="LittleGabriel" />
        <meta name="description" content="Faith-based AI counseling and biblical study platform" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
`;

// Create _document.js in all required locations
writeFile('_document.js', documentContent);
writeFile('pages/_document.js', documentContent);
writeFile('src/pages/_document.js', documentContent);

// Fix 2: Create proper NextAuth route handler
console.log('\n🔧 Creating NextAuth route handler...');
const nextAuthRouteContent = `import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simple export of NextAuth handler with authOptions
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`;

writeFile('src/app/api/auth/[...nextauth]/route.ts', nextAuthRouteContent);

// Fix 3: Fix admin users route TypeScript errors
console.log('\n🔧 Fixing admin users route TypeScript errors...');
const adminUsersRouteContent = `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Retrieve a single user by ID
export async function GET(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = context.params.userId;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT: Update a user by ID
export async function PUT(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = context.params.userId;
  const data = await request.json();
  
  try {
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
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: Remove a user by ID
export async function DELETE(
  request: NextRequest,
  context: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = context.params.userId;
  
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
`;

writeFile('src/app/api/admin/users/[userId]/route.ts', adminUsersRouteContent);

// Fix 4: Update Next.js configuration
console.log('\n🔧 Updating Next.js configuration...');
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs']
  },
}

module.exports = nextConfig
`;

writeFile('next.config.js', nextConfigContent);

console.log('\n✅ All deployment fixes have been applied!');
console.log('Please try deploying the application now.');