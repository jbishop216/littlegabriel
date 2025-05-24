/**
 * Clean and Build Script
 * 
 * This script performs a thorough cleaning of Next.js build artifacts
 * before running a new production build to resolve module resolution issues.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting clean and build process...');

// Directories to clean
const directoriesToClean = [
  '.next',
  'node_modules/.cache',
];

// Clean directories
directoriesToClean.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      console.log(`🗑️ Removing ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed ${dir}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${dir}:`, error.message);
  }
});

// Run document fix script
try {
  console.log('\n📝 Running document fix script...');
  require('./fix-document-issue');
} catch (error) {
  console.error('❌ Error running document fix script:', error.message);
}

// Run production build with error handling
console.log('\n🏗️ Starting production build...');
try {
  // Set environment to production
  process.env.NODE_ENV = 'production';
  
  // Run the build command
  execSync('npx next build', { stdio: 'inherit' });
  
  console.log('\n✅ Production build completed successfully!');
} catch (error) {
  console.error('\n❌ Production build failed:', error.message);
  process.exit(1);
}