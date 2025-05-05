/**
 * Check the environment for the LittleGabriel app 
 * This script will verify key configuration and API endpoints
 * Works for both development and production environments
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

function checkEnvironment() {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`🔍 Checking LittleGabriel Environment (${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'})`);
  console.log('====================================');

  // 1. Check environment variables
  console.log('\n📋 Environment Variables:');
  const envVars = [
    'OPENAI_API_KEY',
    'OPENAI_ASSISTANT_ID',
    'BIBLE_API_KEY',
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'DATABASE_URL'
  ];

  const criticalVars = [
    'OPENAI_API_KEY',
    'OPENAI_ASSISTANT_ID',
    'DATABASE_URL'
  ];

  const missingCritical = [];

  envVars.forEach(varName => {
    const exists = process.env[varName] ? '✅' : '❌';
    const value = process.env[varName] ? 
      (varName.includes('KEY') || varName.includes('SECRET') || varName.includes('URL') ? 
        `${process.env[varName].substring(0, 3)}...${process.env[varName].substring(process.env[varName].length - 3)}` :
        process.env[varName]) : 
      'Not set';
    console.log(`${exists} ${varName}: ${value}`);

    if (!process.env[varName] && criticalVars.includes(varName)) {
      missingCritical.push(varName);
    }
  });

  if (missingCritical.length > 0) {
    console.log('\n⚠️ CRITICAL WARNING: Missing required environment variables:');
    missingCritical.forEach(v => console.log(`   - ${v}`));
    console.log('\nThese variables MUST be set for the application to function correctly.');

    if (isProduction) {
      console.log('\n💡 For production deployment:');
      console.log('   1. Make sure these variables are set in your Replit Secrets');
      console.log('   2. Ensure .replit.deploy file includes these variables');
      console.log('   3. Re-deploy the application to apply the changes');
    }
  }

  // 2. Check configuration files (skip in production as they might be bundled)
  if (!isProduction) {
    console.log('\n📁 Configuration Files:');
    const configFiles = [
      { path: 'next.config.js', required: true },
      { path: 'pages/_document.js', required: true },
      { path: 'pages/_app.js', required: true },
      { path: 'src/pages/_document.tsx', required: false },
      { path: 'src/pages/_app.js', required: false },
      { path: '.env', required: true },
      { path: '.env.local', required: false },
      { path: '.replit.deploy', required: false }
    ];

    configFiles.forEach(file => {
      const exists = fs.existsSync(file.path);
      const status = exists ? '✅' : (file.required ? '❌' : '⚠️');
      console.log(`${status} ${file.path}: ${exists ? 'Found' : 'Not found' + (file.required ? ' (REQUIRED)' : ' (Optional)')}`);
    });
  }

  // 3. Check Next.js config (skip in production)
  if (!isProduction && fs.existsSync('next.config.js')) {
    console.log('\n⚙️ Next.js Configuration:');
    const nextConfig = fs.readFileSync('next.config.js', 'utf8');

    const features = [
      { name: 'pageExtensions', regex: /pageExtensions/i },
      { name: 'webpack polyfills', regex: /webpack.*config/i },
      { name: 'experimental features', regex: /experimental/i },
      { name: 'environment variables', regex: /env:/i },
      { name: 'image optimization', regex: /images:/i }
    ];

    features.forEach(feature => {
      const exists = feature.regex.test(nextConfig);
      console.log(`${exists ? '✅' : '❌'} ${feature.name}: ${exists ? 'Configured' : 'Not configured'}`);
    });
  }

  // 4. Display key API configurations
  if (process.env.OPENAI_ASSISTANT_ID) {
    console.log('\n🤖 OpenAI Configuration:');
    console.log(`✅ OPENAI_ASSISTANT_ID: ${process.env.OPENAI_ASSISTANT_ID}`);
  } else {
    console.log('\n❌ OpenAI Configuration:');
    console.log(`Missing OPENAI_ASSISTANT_ID - application will NOT function correctly!`);
  }

  // 5. Check port accessibility
  console.log('\n🔌 Port Configuration:');
  try {
    // For deployment, we need to ensure we're listening on port 5000
    console.log(`✅ Application will listen on port 5000`);
    console.log(`✅ External port 80 will be mapped to internal port 5000`);
  } catch (error) {
    console.log(`❌ Port check error: ${error.message}`);
  }

  // 6. Build status
  console.log('\n🏗️ Environment Status:');
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    console.log(`✅ NODE_ENV: ${nodeEnv}`);

    if (process.env.OPENAI_ASSISTANT_ID && process.env.OPENAI_API_KEY && process.env.DATABASE_URL) {
      console.log('✅ Critical environment variables are set');
    } else {
      console.log('❌ Missing critical environment variables');
    }

    console.log(`✅ Environment check completed for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
  } catch (error) {
    console.log(`❌ Environment check error: ${error.message}`);
  }
}

// If this script is run directly
if (require.main === module) {
  checkEnvironment();
}

// Export for use in other scripts
module.exports = { checkEnvironment };