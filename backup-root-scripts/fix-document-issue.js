/**
 * Fix for _document.js issue
 * 
 * This script checks and creates the _document.js files in the right locations
 * to ensure a successful build process.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing _document.js Structure');
console.log('==============================');

// Define the expected locations for _document files
const documentLocations = [
  'pages/_document.js',
  'src/pages/_document.tsx',
  'src/_document.tsx'
];

// The content to use for _document files
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
}`;

// Check or create the _document files in each location
documentLocations.forEach(location => {
  const filePath = path.join(__dirname, location);
  
  // Create directory if it doesn't exist
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
  
  // Create or update the file
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${location} already exists`);
  } else {
    fs.writeFileSync(filePath, documentContent);
    console.log(`✅ Created ${location}`);
  }
});

// Create a basic _app.js file
const appFilePath = path.join(__dirname, 'pages/_app.js');
if (!fs.existsSync(appFilePath)) {
  const appContent = `import '../src/app/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`;
  fs.writeFileSync(appFilePath, appContent);
  console.log('✅ Created pages/_app.js');
}

// Create a not-found page
const notFoundPath = path.join(__dirname, 'pages/not-found.js');
if (!fs.existsSync(notFoundPath)) {
  const notFoundContent = `export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-center mb-8">
        The page you are looking for does not exist.
      </p>
    </div>
  );
}`;
  fs.writeFileSync(notFoundPath, notFoundContent);
  console.log('✅ Created pages/not-found.js');
}

// Create a modified next.config.js with distDir specified
const nextConfigPath = path.join(__dirname, 'next.config.js');
const existingConfig = fs.existsSync(nextConfigPath) ? fs.readFileSync(nextConfigPath, 'utf8') : '';

if (!existingConfig.includes('distDir')) {
  console.log('Adding distDir to next.config.js');
  
  // If there's an existing config, modify it
  if (existingConfig) {
    const updatedConfig = existingConfig.replace(
      /module\.exports\s*=\s*(?:nextConfig|{)/,
      `module.exports = {\n  distDir: '.next',`
    );
    fs.writeFileSync(nextConfigPath, updatedConfig);
  } 
  // Otherwise create a new config
  else {
    const newConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  reactStrictMode: false,
  env: {
    OPENAI_ASSISTANT_ID: 'asst_BpFiJmyhoHFYUj5ooLEoHEX2',
  }
};

module.exports = nextConfig;`;
    fs.writeFileSync(nextConfigPath, newConfig);
  }
  
  console.log('✅ Updated next.config.js with distDir');
}

console.log('\n✅ _document.js structure fix completed!');
console.log('You should now be able to build the application successfully.');