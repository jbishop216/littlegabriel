/**
 * Fix Duplicate Files Script
 * 
 * This script identifies and resolves duplicate files in the Next.js project
 * that might cause deployment errors or warnings.
 */

const fs = require('fs');
const path = require('path');

// Paths to check for duplicates
const duplicateCheckPaths = [
  { 
    paths: ['pages/not-found.tsx', 'pages/not-found.js'], 
    message: 'Duplicate not-found page detected'
  },
  { 
    paths: ['src/app/not-found.tsx', 'src/app/not-found.js'], 
    message: 'Duplicate app not-found page detected'
  },
  {
    paths: ['_document.js', 'pages/_document.js', 'src/pages/_document.js'],
    message: 'Multiple _document.js files detected'
  }
];

console.log('🔍 Checking for duplicate files that may cause deployment issues...');

// Check for duplicates and resolve them
duplicateCheckPaths.forEach(({paths, message}) => {
  const existingFiles = paths.filter(p => fs.existsSync(p));
  
  if (existingFiles.length > 1) {
    console.log(`❌ ${message}: ${existingFiles.join(', ')}`);
    
    // Keep only the first file in the list, remove others
    existingFiles.slice(1).forEach(file => {
      console.log(`   - Removing duplicate: ${file}`);
      fs.unlinkSync(file);
    });
    
    console.log(`✅ Resolved: Kept ${existingFiles[0]} and removed duplicates`);
  } else if (existingFiles.length === 1) {
    console.log(`✅ Found single file: ${existingFiles[0]}`);
  } else {
    console.log(`ℹ️ No files found for: ${paths.join(', ')}`);
  }
});

// Remove the duplicate pages/not-found.js if it exists
if (fs.existsSync('pages/not-found.js') && fs.existsSync('pages/not-found.tsx')) {
  console.log('❌ Duplicate not-found page detected');
  console.log('   - Removing pages/not-found.js');
  fs.unlinkSync('pages/not-found.js');
  console.log('✅ Removed duplicate not-found page');
}

console.log('\n🚀 Duplicate file check complete! Your project should now deploy without file duplication issues.');