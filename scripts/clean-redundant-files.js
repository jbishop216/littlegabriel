/**
 * Clean Redundant Files
 * 
 * This script removes unnecessary duplicate files from the project that
 * might be causing build errors, especially around not-found pages.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for redundant files that might cause build errors...');

// Files to check and potentially remove
const filesToCheck = [
  'src/app/not-found.js',
  'pages/not-found.js',
  'pages/not-found.tsx',
  'src/pages/not-found.js',
  'src/pages/not-found.tsx',
  'src/app/_not-found.js',
  'src/app/_not-found.tsx',
];

// Keep track of what we've removed
const removedFiles = [];

// Check each file and remove if it exists
filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`🗑️ Removing: ${file}`);
    fs.unlinkSync(file);
    removedFiles.push(file);
  }
});

// Create a simple standard not-found.tsx in the app directory if needed
if (!fs.existsSync('src/app/not-found.tsx') || removedFiles.includes('src/app/not-found.tsx')) {
  console.log('📝 Creating a standard not-found.tsx in src/app/');
  
  const notFoundContent = `
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mt-4">Page Not Found</h2>
        <p className="text-gray-500 mt-2">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync('src/app/not-found.tsx', notFoundContent);
  console.log('✅ Created standard not-found.tsx in src/app/');
}

console.log(`\n🚀 Removed ${removedFiles.length} redundant files to help fix build errors.`);