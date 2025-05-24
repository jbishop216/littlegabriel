/**
 * Fix for _document.js issue
 * 
 * This script checks and creates the _document.js files in the right locations
 * to ensure a successful build process.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting _document.js fix...');

// Standard document content
const documentContent = `import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}`;

// Paths to check and create _document.js
const documentPaths = [
  '_document.js',
  'pages/_document.js',
  'src/pages/_document.js',
  'src/_document.js',
  'src/app/_document.js',
];

// Create directories if they don't exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
};

// Create or update file
const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created/updated file: ${filePath}`);
};

// Process each document path
documentPaths.forEach(docPath => {
  writeFile(docPath, documentContent);
});

// Additional fix: create minimal _app.js in pages directory if it doesn't exist
const appContent = `import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}`;

// Ensure styles directory and globals.css exist
ensureDir('styles');
if (!fs.existsSync('styles/globals.css')) {
  writeFile('styles/globals.css', `
html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
`);
}

// Create _app.js if it doesn't exist
if (!fs.existsSync('pages/_app.js')) {
  writeFile('pages/_app.js', appContent);
}

console.log('\n✅ _document.js fix completed! This should solve the document not found error in production builds.');
console.log('ℹ️ Make sure to run the production build again to apply these changes.');