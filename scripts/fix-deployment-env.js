/**
 * Fix Deployment Environment Variables
 * 
 * This script ensures all necessary environment variables are properly set for deployment,
 * including creating the .env.production file with values from Replit secrets.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load existing environment variables from .env files
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Environment variables that need to be properly set for production
const REQUIRED_ENV_VARS = [
  'OPENAI_API_KEY',
  'OPENAI_ASSISTANT_ID',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
];

// Create the production environment file path
const ENV_PRODUCTION_PATH = path.join(process.cwd(), '.env.production');

/**
 * Main function to fix deployment environment variables
 */
async function fixDeploymentEnv() {
  console.log('\nFix Deployment Environment Variables');
  console.log('==================================');
  
  // Check if .env.production exists
  const envProductionExists = fs.existsSync(ENV_PRODUCTION_PATH);
  console.log(`.env.production exists: ${envProductionExists}`);
  
  // Read existing .env.production if it exists
  let existingEnvProduction = {};
  if (envProductionExists) {
    try {
      existingEnvProduction = dotenv.parse(fs.readFileSync(ENV_PRODUCTION_PATH));
      console.log('Existing .env.production variables:', Object.keys(existingEnvProduction).join(', '));
    } catch (err) {
      console.error('Error reading .env.production:', err.message);
    }
  }
  
  // Create a new production env file with variables from current environment and existing .env.production
  const newEnvProduction = {};
  
  // First add all existing variables from .env.production
  Object.assign(newEnvProduction, existingEnvProduction);
  
  // Then add variables from the current environment (process.env) that are required
  for (const envVar of REQUIRED_ENV_VARS) {
    // Only update if there's a value in process.env
    if (process.env[envVar]) {
      newEnvProduction[envVar] = process.env[envVar];
    }
  }
  
  // Generate the .env.production file content
  const envFileContent = Object.entries(newEnvProduction)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Write the .env.production file
  fs.writeFileSync(ENV_PRODUCTION_PATH, envFileContent);
  console.log(`\n✅ Successfully wrote .env.production with the following variables:`);
  console.log(Object.keys(newEnvProduction).map(key => `  - ${key}`).join('\n'));
  
  // Verify environment variable presence
  console.log('\nEnvironment Variables Status:');
  for (const envVar of REQUIRED_ENV_VARS) {
    const valueSource = newEnvProduction[envVar] ? '.env.production' :
                      process.env[envVar] ? 'process.env' : 'MISSING';
    
    console.log(`  - ${envVar}: ${valueSource}`);
    
    if (valueSource === 'MISSING') {
      console.warn(`    ⚠️ Warning: ${envVar} is not set in any environment. This may cause issues in production.`);
    }
  }
}

// Run the function
fixDeploymentEnv().catch(err => {
  console.error('Error fixing deployment environment:', err);
  process.exit(1);
});
