/**
 * DEPLOY FIX ENVIRONMENT - LittleGabriel Application
 * 
 * This script ensures that all environment variables are properly set before deployment.
 * It's designed to be run automatically before the build process.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running deployment environment fix script...');

// First, ensure environment variables are properly set
require('./update-env-for-deploy');

// Make sure _document.js exists in various locations where Next.js might look for it
const documentPaths = [
  './pages/_document.js',
  './src/pages/_document.js',
  './_document.js',
  './src/_document.js'
];

const basicDocumentContent = `
import { Html, Head, Main, NextScript } from 'next/document'

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

// Ensure all document paths exist
documentPaths.forEach(docPath => {
  const fullPath = path.join(__dirname, docPath);
  const dirPath = path.dirname(fullPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Create file if it doesn't exist
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating file: ${fullPath}`);
    fs.writeFileSync(fullPath, basicDocumentContent);
  }
});

// Create a special health check endpoint for deployments
const healthCheckPath = path.join(__dirname, 'pages/api/health.js');
const healthCheckContent = `
/**
 * Simple health check endpoint for deployment verification
 * This helps to verify that the application is running correctly
 */
export default function handler(req, res) {
  // Check for critical environment variables
  const envStatus = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    OPENAI_ASSISTANT_ID: !!process.env.OPENAI_ASSISTANT_ID,
    NODE_ENV: process.env.NODE_ENV,
  };
  
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: envStatus
  });
}
`;

// Create health check endpoint directory
const healthCheckDir = path.dirname(healthCheckPath);
if (!fs.existsSync(healthCheckDir)) {
  console.log(`Creating directory: ${healthCheckDir}`);
  fs.mkdirSync(healthCheckDir, { recursive: true });
}

// Create health check file
console.log(`Creating health check endpoint: ${healthCheckPath}`);
fs.writeFileSync(healthCheckPath, healthCheckContent);

// Ensure next.config.js has the correct configuration
console.log('Checking and updating next.config.js...');

const nextConfigPath = path.join(__dirname, 'next.config.js');
const nextConfigContent = `/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    OPENAI_ASSISTANT_ID: '${process.env.OPENAI_ASSISTANT_ID || 'asst_BpFiJmyhoHFYUj5ooLEoHEX2'}',
    NEXT_PUBLIC_DEPLOYMENT_MODE: 'production',
  },
  // Important for proper functioning in Replit deployments
  transpilePackages: ['next-auth'],
  // Add server components packages if needed
  serverExternalPackages: [],
};
`;

// Write next.config.js
fs.writeFileSync(nextConfigPath, nextConfigContent);
console.log('✅ Updated next.config.js');

console.log('🎉 Deployment environment fix complete!');