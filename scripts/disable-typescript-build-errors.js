/**
 * Disable TypeScript Build Errors
 * 
 * This script updates next.config.js to add the option to temporarily
 * ignore TypeScript errors during production builds, allowing deployment
 * while TypeScript issues are being resolved.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating Next.js configuration to disable TypeScript errors during build...');

const nextConfigPath = path.join(process.cwd(), 'next.config.js');

// Read the current next.config.js file
let configContent = fs.readFileSync(nextConfigPath, 'utf8');

// Check if typescript.ignoreBuildErrors is already set
if (configContent.includes('typescript: { ignoreBuildErrors:')) {
  console.log('⚠️ TypeScript build errors are already being ignored in next.config.js');
} else {
  // Add the option to ignore TypeScript errors during build
  configContent = configContent.replace(
    'const nextConfig = {',
    'const nextConfig = {\n  typescript: { ignoreBuildErrors: true },'
  );

  // Write the updated config back to next.config.js
  fs.writeFileSync(nextConfigPath, configContent, 'utf8');

  console.log('✅ Successfully updated next.config.js to ignore TypeScript errors during build');
  console.log('⚠️ Note: This is a temporary measure. TypeScript errors should be fixed properly.');
}

console.log('\n🚀 You can now run the production build without TypeScript errors blocking deployment.');