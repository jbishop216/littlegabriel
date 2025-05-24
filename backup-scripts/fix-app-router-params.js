/**
 * Fix App Router Params Script
 * 
 * This script fixes the common TypeScript error in App Router route handlers
 * by updating the parameter destructuring to use the correct format.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for App Router routes with parameter issues...');

// Function to process a file
function processFile(filePath) {
  console.log(`Checking ${filePath}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Update parameter destructuring
  let updatedContent = content.replace(
    /export async function (GET|POST|PUT|PATCH|DELETE)\(\s*req: NextRequest,\s*\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([a-zA-Z0-9]+):\s*string\s*\}\s*\}\s*\)/g,
    'export async function $1(\n  req: NextRequest,\n  context: { params: { $2: string } }\n)'
  );
  
  // Update all usages of params.id inside the functions
  updatedContent = updatedContent.replace(/params\.([a-zA-Z0-9]+)/g, 'context.params.$1');
  
  // Write back if changes were made
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ Fixed parameter issues in ${filePath}`);
    return true;
  }
  
  return false;
}

// Recursive function to walk through directories
function walkDir(dir) {
  let fixedFiles = 0;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        fixedFiles += walkDir(filePath);
      }
    } else if (file.endsWith('route.ts') || file.endsWith('route.js')) {
      if (processFile(filePath)) {
        fixedFiles++;
      }
    }
  }
  
  return fixedFiles;
}

// Start processing from app directory
const appDir = path.join('src', 'app');
if (fs.existsSync(appDir)) {
  const fixedCount = walkDir(appDir);
  console.log(`\n🚀 Fixed parameter issues in ${fixedCount} route files.`);
} else {
  console.log('❌ App directory not found. Make sure you run this script in the project root.');
}