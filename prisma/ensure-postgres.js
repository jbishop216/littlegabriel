// Script to ensure Prisma is properly configured for PostgreSQL
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking Prisma schema configuration...');

// Read the schema file
const schemaPath = path.join(__dirname, 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Check if the schema is already configured for PostgreSQL
if (!schema.includes('provider = "postgresql"')) {
  console.log('⚠️ Prisma schema is not configured for PostgreSQL. Updating...');
  
  // Update the schema to use PostgreSQL
  const updatedSchema = schema.replace(
    /provider = "sqlite"[\s\S]*?url\s*=\s*"file:\.\/dev\.db"/,
    'provider = "postgresql"\n  url      = env("DATABASE_URL")'
  );
  
  // Write the updated schema back to the file
  fs.writeFileSync(schemaPath, updatedSchema);
  console.log('✅ Updated Prisma schema to use PostgreSQL');
} else {
  console.log('✅ Prisma schema is already configured for PostgreSQL');
}

// Generate the Prisma client
console.log('🔄 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error);
  process.exit(1);
}
