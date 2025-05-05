/**
 * Compare Environment Variables Between Development and Production
 * 
 * This script compares the environment variables between development and production
 * to help identify differences that might cause the OpenAI Assistant to stop working
 * when deployed to production.
 */

const fs = require('fs');
const path = require('path');

// Define paths
const envPath = path.join(__dirname, '../.env');
const envLocalPath = path.join(__dirname, '../.env.local');
const envProductionPath = path.join(__dirname, '../.env.production');

// Helper function to parse environment variables from a file
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || line.trim() === '') {
      return;
    }
    
    // Parse key-value pairs
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      vars[key.trim()] = value.trim();
    }
  });
  
  return vars;
}

// Function to highlight differences
function highlightDifferences(name, value, otherValue) {
  if (value === otherValue) {
    return value;
  }
  
  // Highlight differences for OpenAI-related variables
  if (name.includes('OPENAI') || name.includes('ASSISTANT')) {
    return `\x1b[31m${value}\x1b[0m (DIFFERENT from other env: ${otherValue})`;
  }
  
  return `${value} (different from other env: ${otherValue})`;
}

// Main function
function compareEnvironments() {
  console.log('=== Environment Variables Comparison ===\n');
  
  // Parse environment files
  const devVars = parseEnvFile(envPath);
  const devLocalVars = parseEnvFile(envLocalPath);
  const prodVars = parseEnvFile(envProductionPath);
  
  // Combine dev and devLocal vars (devLocal overrides dev)
  const combinedDevVars = { ...devVars, ...devLocalVars };
  
  // Get all unique variable names
  const allVarNames = new Set([
    ...Object.keys(combinedDevVars),
    ...Object.keys(prodVars)
  ]);
  
  // Count variables
  const devOnlyVars = [];
  const prodOnlyVars = [];
  const commonVars = [];
  const differentVars = [];
  
  // Compare variables
  console.log('VARIABLE COMPARISON:\n');
  console.log('VARIABLE NAME'.padEnd(30) + '| DEVELOPMENT'.padEnd(40) + '| PRODUCTION');
  console.log('-'.repeat(100));
  
  Array.from(allVarNames).sort().forEach(name => {
    const devValue = combinedDevVars[name];
    const prodValue = prodVars[name];
    
    let devDisplay = devValue || '\x1b[90m<not set>\x1b[0m';
    let prodDisplay = prodValue || '\x1b[90m<not set>\x1b[0m';
    
    // For OPENAI API keys, show only first few characters
    if (name === 'OPENAI_API_KEY' && devValue) {
      devDisplay = devValue.substring(0, 10) + '...';
    }
    if (name === 'OPENAI_API_KEY' && prodValue) {
      prodDisplay = prodValue.substring(0, 10) + '...';
    }
    
    // Track different categories
    if (devValue && !prodValue) {
      devOnlyVars.push(name);
    } else if (!devValue && prodValue) {
      prodOnlyVars.push(name);
    } else if (devValue !== prodValue) {
      differentVars.push(name);
    } else {
      commonVars.push(name);
    }
    
    // Display comparison
    if (devValue !== prodValue) {
      if (name.includes('OPENAI') || name.includes('ASSISTANT')) {
        console.log(`\x1b[33m${name.padEnd(30)}\x1b[0m| ${devDisplay.padEnd(38)}| ${prodDisplay}`);
      } else {
        console.log(`${name.padEnd(30)}| ${devDisplay.padEnd(38)}| ${prodDisplay}`);
      }
    } else {
      console.log(`${name.padEnd(30)}| ${devDisplay.padEnd(38)}| ${prodDisplay}`);
    }
  });
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Total variables: ${allVarNames.size}`);
  console.log(`Common variables (same in both environments): ${commonVars.length}`);
  console.log(`Different variables (different values): ${differentVars.length}`);
  console.log(`Development-only variables: ${devOnlyVars.length}`);
  console.log(`Production-only variables: ${prodOnlyVars.length}`);
  
  // Focus on OpenAI variables
  console.log('\n=== OPENAI-RELATED VARIABLES ===');
  const openaiVars = Array.from(allVarNames).filter(name => {
    return name.includes('OPENAI') || name.includes('ASSISTANT');
  });
  
  if (openaiVars.length === 0) {
    console.log('No OpenAI-related variables found.');
  } else {
    openaiVars.forEach(name => {
      const devValue = combinedDevVars[name];
      const prodValue = prodVars[name];
      
      let devDisplay = devValue || '<not set>';
      let prodDisplay = prodValue || '<not set>';
      
      // For OPENAI API keys, show only first few characters
      if (name === 'OPENAI_API_KEY' && devValue) {
        devDisplay = devValue.substring(0, 10) + '...';
      }
      if (name === 'OPENAI_API_KEY' && prodValue) {
        prodDisplay = prodValue.substring(0, 10) + '...';
      }
      
      console.log(`${name}:`);
      console.log(`  DEV:  ${devDisplay}`);
      console.log(`  PROD: ${prodDisplay}`);
      
      if (devValue !== prodValue) {
        console.log(`  \x1b[31mWARNING: Different values in development and production!\x1b[0m`);
      }
      console.log('');
    });
  }
  
  // Recommendations
  console.log('=== RECOMMENDATIONS ===');
  
  if (differentVars.filter(name => name.includes('OPENAI') || name.includes('ASSISTANT')).length > 0) {
    console.log('\x1b[31m1. OpenAI-related variables have different values in development and production!\x1b[0m');
    console.log('   This could be causing the assistant to stop working in production.');
    console.log('   Consider syncing these values between environments.');
  } else if (openaiVars.length === 0) {
    console.log('1. No OpenAI-related variables found. Make sure you have properly configured:');
    console.log('   - OPENAI_API_KEY');
    console.log('   - OPENAI_ASSISTANT_ID');
    console.log('   - FORCE_OPENAI_ASSISTANT=true (for production)');
  } else {
    console.log('1. OpenAI-related variables appear to be consistent between environments.');
  }
  
  if (!combinedDevVars['FORCE_OPENAI_ASSISTANT'] && !prodVars['FORCE_OPENAI_ASSISTANT']) {
    console.log('\n2. Neither environment has FORCE_OPENAI_ASSISTANT=true set.');
    console.log('   Add this to .env.production to ensure the assistant is used in production.');
  } else if (prodVars['FORCE_OPENAI_ASSISTANT'] !== 'true') {
    console.log('\n\x1b[31m2. Production environment does not have FORCE_OPENAI_ASSISTANT=true!\x1b[0m');
    console.log('   This is likely why the assistant is not working in production.');
    console.log('   Add FORCE_OPENAI_ASSISTANT=true to .env.production.');
  }
  
  console.log('\n3. To test production environment locally:');
  console.log('   Run: node scripts/dev-prod-mode.js prod');
  console.log('   Then: node scripts/test-prod-environment.js');
  console.log('\n4. To switch back to development mode:');
  console.log('   Run: node scripts/dev-prod-mode.js dev');
}

// Run the comparison
compareEnvironments();
