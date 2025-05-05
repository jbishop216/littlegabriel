/**
 * Fix Deployment Issues Script
 * 
 * This script addresses the specific deployment errors shown in the error log:
 * 1. TypeScript error in src/app/api/admin/users/[userId]/route.ts
 * 2. Missing NextAuth environment variables
 * 3. Port configuration mismatch (needs port 80 not 5000)
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting deployment fixes...');

// 1. Fix the TypeScript error by ensuring the route file exists with proper typing
const usersApiDir = path.join(__dirname, 'src', 'app', 'api', 'admin', 'users', '[userId]');
if (!fs.existsSync(usersApiDir)) {
  console.log(`Creating directory: ${usersApiDir}`);
  fs.mkdirSync(usersApiDir, { recursive: true });
}

const routeFilePath = path.join(usersApiDir, 'route.ts');
const routeFileContent = `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const userId = params.userId;
  
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const userId = params.userId;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || session.user.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const userId = params.userId;
  
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

fs.writeFileSync(routeFilePath, routeFileContent);
console.log(`✅ Fixed TypeScript route file: ${routeFilePath}`);

// 2. Create NextAuth environment variables
const updateEnvPath = path.join(__dirname, 'update-env-for-deploy.js');
if (fs.existsSync(updateEnvPath)) {
  console.log('Updating .env.production with NextAuth variables...');
  
  // Generate random secret for NextAuth if not set
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = require('crypto').randomBytes(32).toString('hex');
    console.log('✅ Generated new NEXTAUTH_SECRET');
  }
  
  // Set the URL based on Replit domain or use a fallback
  if (!process.env.NEXTAUTH_URL) {
    if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
      process.env.NEXTAUTH_URL = `https://${process.env.REPL_SLUG}-${process.env.REPL_OWNER}.replit.app`;
    } else {
      process.env.NEXTAUTH_URL = 'https://little-gabriel-jbishop216.replit.app';
    }
    console.log(`✅ Set NEXTAUTH_URL to ${process.env.NEXTAUTH_URL}`);
  }
  
  // Run the update script
  require(updateEnvPath);
}

// 3. Fix the startup.js file to use port 80 in production
const startupPath = path.join(__dirname, 'startup.js');
let startupContent = fs.existsSync(startupPath) ? fs.readFileSync(startupPath, 'utf8') : '';

if (startupContent) {
  // Modify to use port 80 in production
  if (!startupContent.includes('process.env.PORT || 80')) {
    startupContent = startupContent.replace(/process\.env\.PORT\s+\|\|\s+5000/g, 'process.env.PORT || 80');
    startupContent = startupContent.replace(/port\s*=\s*5000/g, 'port = process.env.PORT || 80');
    fs.writeFileSync(startupPath, startupContent);
    console.log('✅ Updated startup.js to use port 80 in production');
  }
} else {
  // Create startup.js if it doesn't exist
  const newStartupContent = `/**
 * Startup script for deployment environments
 * 
 * This script ensures all environment variables are properly set
 * before starting the Next.js application.
 */

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run environment setup first
execSync('node update-env-for-deploy.js', { stdio: 'inherit' });

// For production, use port 80 (required by Replit deployment)
const port = process.env.PORT || 80;

// Start the Next.js application
exec('next start -p ' + port, { stdio: 'inherit' });
console.log('\n🚀 Starting Next.js on port ' + port + '\n');
`;

  fs.writeFileSync(startupPath, newStartupContent);
  console.log(`✅ Created new startup.js with correct port configuration`);
}

// 4. Update package.json start script
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Update start script to use startup.js
if (packageJson.scripts && packageJson.scripts.start !== 'node startup.js') {
  packageJson.scripts.start = 'node startup.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json start script to use startup.js');
}

// 5. Ensure _document.js exists in the right places
const documentPaths = [
  path.join(__dirname, 'pages', '_document.js'),
  path.join(__dirname, 'src', 'pages', '_document.js'),
];

const documentContent = `import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
`;

documentPaths.forEach(docPath => {
  const dir = path.dirname(docPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(docPath)) {
    fs.writeFileSync(docPath, documentContent);
    console.log(`✅ Created ${docPath}`);
  }
});

console.log('\n🎉 All deployment fixes completed successfully! You can now deploy the application.');
