/**
 * A script to check if the _document file can be loaded properly
 */
const fs = require('fs');
const path = require('path');

// Check if _document.tsx exists
const documentPath = path.join(__dirname, 'src', 'pages', '_document.tsx');
console.log(`Checking if document file exists at: ${documentPath}`);

if (fs.existsSync(documentPath)) {
  console.log('✅ _document.tsx file exists');
  
  // Print the content
  const content = fs.readFileSync(documentPath, 'utf8');
  console.log('\nFile content:');
  console.log(content);
} else {
  console.log('❌ _document.tsx file does not exist');
}

// Also check for any duplicate document files
console.log('\nChecking for duplicate _document files:');
const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir);
const documentFiles = files.filter(file => file.startsWith('_document.'));

console.log(`Found ${documentFiles.length} document files:`);
documentFiles.forEach(file => {
  console.log(`- ${file}`);
});