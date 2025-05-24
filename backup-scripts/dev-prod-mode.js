/**
 * Development-Production Mode Switcher
 * 
 * This script allows you to run your development environment with production settings
 * to test OpenAI Assistant integration without having to deploy.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Define paths
const envLocalPath = path.join(__dirname, '../.env.local');
const envBackupPath = path.join(__dirname, '../.env.local.backup');

// Get command line arguments
const args = process.argv.slice(2);
const mode = args[0] || 'dev';

// Check if mode is valid
if (!['dev', 'prod', 'status'].includes(mode)) {
  console.error('Invalid mode. Usage: node dev-prod-mode.js [dev|prod|status]');
  process.exit(1);
}

// Status command - show current mode without making changes
if (mode === 'status') {
  checkCurrentMode();
  process.exit(0);
}

// Backup .env.local if it exists and we don't already have a backup
function backupEnvLocal() {
  if (fs.existsSync(envLocalPath) && !fs.existsSync(envBackupPath)) {
    console.log('Creating backup of .env.local...');
    fs.copyFileSync(envLocalPath, envBackupPath);
    console.log('✅ Backup created at .env.local.backup');
    return true;
  } else if (!fs.existsSync(envLocalPath)) {
    console.log('No .env.local file found to backup.');
    return false;
  } else {
    console.log('Backup already exists, using existing backup.');
    return true;
  }
}

// Restore backup if it exists
function restoreEnvLocal() {
  if (fs.existsSync(envBackupPath)) {
    console.log('Restoring .env.local from backup...');
    fs.copyFileSync(envBackupPath, envLocalPath);
    console.log('✅ Original .env.local restored');
    return true;
  } else {
    console.log('No backup found to restore.');
    return false;
  }
}

// Create production-like .env.local
function createProdLikeEnv() {
  console.log('Creating production-like environment...');
  
  // Get the contents of .env.production if it exists
  let prodEnvContent = '';
  const envProductionPath = path.join(__dirname, '../.env.production');
  
  if (fs.existsSync(envProductionPath)) {
    prodEnvContent = fs.readFileSync(envProductionPath, 'utf8');
  } else {
    console.error('⚠️ No .env.production file found. Creating minimal production settings.');
    prodEnvContent = 'NODE_ENV=production\nFORCE_OPENAI_ASSISTANT=true\n';
  }
  
  // Create a .env.local with production settings
  const localEnvContent = `# PRODUCTION-LIKE MODE - Created by dev-prod-mode.js\n# Original .env.local has been backed up to .env.local.backup\n\n${prodEnvContent}\n\n# Additional development settings\nNEXT_PUBLIC_DEV_PROD_MODE=production\n`;
  
  fs.writeFileSync(envLocalPath, localEnvContent);
  console.log('✅ Production-like .env.local created');
  return true;
}

// Check the current mode
function checkCurrentMode() {
  if (!fs.existsSync(envLocalPath)) {
    console.log('Current mode: DEVELOPMENT (default, no .env.local file found)');
    return;
  }
  
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  if (envContent.includes('PRODUCTION-LIKE MODE')) {
    console.log('Current mode: PRODUCTION-LIKE');
    if (envContent.includes('NODE_ENV=production')) {
      console.log('✅ NODE_ENV is set to production');
    } else {
      console.log('⚠️ NODE_ENV may not be properly set to production');
    }
    
    if (envContent.includes('FORCE_OPENAI_ASSISTANT=true')) {
      console.log('✅ FORCE_OPENAI_ASSISTANT is set to true');
    } else {
      console.log('⚠️ FORCE_OPENAI_ASSISTANT may not be properly set');
    }
  } else if (fs.existsSync(envBackupPath)) {
    console.log('Current mode: DEVELOPMENT (with existing backup)');
  } else {
    console.log('Current mode: DEVELOPMENT');
  }
}

// Switch to production-like mode
function switchToProdMode() {
  console.log('Switching to PRODUCTION-LIKE mode...');
  const hasBackup = backupEnvLocal();
  createProdLikeEnv();
  console.log('\n======== PRODUCTION-LIKE MODE ACTIVATED ========');
  console.log('The app will now run with production environment settings.');
  console.log('The OpenAI Assistant should work exactly as it would in production.');
  console.log('\nTo switch back to development mode:');
  console.log('node scripts/dev-prod-mode.js dev');
  console.log('===============================================');
}

// Switch to development mode
function switchToDevMode() {
  console.log('Switching to DEVELOPMENT mode...');
  const restored = restoreEnvLocal();
  if (restored) {
    console.log('\n======== DEVELOPMENT MODE ACTIVATED ========');
    console.log('The app will now run with your original development settings.');
    console.log('===============================================');
  } else {
    console.log('\n⚠️ Could not restore development environment.');
    console.log('You may need to manually configure .env.local for development.');
  }
}

// Main function
function main() {
  if (mode === 'prod') {
    switchToProdMode();
  } else if (mode === 'dev') {
    switchToDevMode();
  }
  
  // Show current mode after changes
  console.log('');
  checkCurrentMode();
}

// Run the main function
main();
