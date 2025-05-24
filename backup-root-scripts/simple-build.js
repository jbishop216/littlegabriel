/**
 * Simple production build script for Next.js
 * 
 * This script provides a more robust production build process
 * by handling environment variable setup and error recovery.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Essential environment variables for build
process.env.NODE_ENV = 'production';
process.env.OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2';

console.log('🏗️ Starting enhanced production build');
console.log('===============================');
console.log('Environment:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`OPENAI_ASSISTANT_ID: ${process.env.OPENAI_ASSISTANT_ID}`);

// Helper function to ensure files exist in expected locations
function ensureFiles() {
  console.log('\n🔍 Ensuring critical files exist');
  
  // Make sure pages/_document.js exists
  const documentPath = path.join(__dirname, 'pages', '_document.js');
  if (!fs.existsSync(documentPath)) {
    const dir = path.dirname(documentPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory ${dir}`);
    }
    
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
    
    fs.writeFileSync(documentPath, documentContent);
    console.log(`✅ Created ${documentPath}`);
  } else {
    console.log(`✅ ${documentPath} already exists`);
  }
  
  // Make sure pages/_app.js exists
  const appPath = path.join(__dirname, 'pages', '_app.js');
  if (!fs.existsSync(appPath)) {
    const appContent = `import '../src/app/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`;
    
    fs.writeFileSync(appPath, appContent);
    console.log(`✅ Created ${appPath}`);
  } else {
    console.log(`✅ ${appPath} already exists`);
  }
  
  // Remove problematic files that might interfere with build
  const notFoundPath = path.join(__dirname, 'src/app/_not-found.js');
  if (fs.existsSync(notFoundPath)) {
    fs.unlinkSync(notFoundPath);
    console.log(`✅ Removed problematic file ${notFoundPath}`);
  }
}

// Run the build with error handling
function runBuild() {
  console.log('\n🚀 Running production build');
  try {
    // First ensure the necessary files exist
    ensureFiles();
    
    // Clean any previous build artifacts
    console.log('Cleaning previous build...');
    try {
      execSync('rm -rf .next', { stdio: 'inherit' });
    } catch (error) {
      console.log('Clean step failed, but continuing...');
    }
    
    // Run the build with environment variables explicitly set
    console.log('Running Next.js build...');
    execSync('NODE_ENV=production OPENAI_ASSISTANT_ID=asst_BpFiJmyhoHFYUj5ooLEoHEX2 npx next build', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        OPENAI_ASSISTANT_ID: 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'
      }
    });
    
    console.log('\n✅ Build completed successfully!');
    return true;
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}`);
    return false;
  }
}

// Execute the build
if (runBuild()) {
  console.log('✅ You can now deploy your application');
} else {
  console.log('❌ Fix the errors above and try again');
  process.exit(1);
}