// Script to test the database connection directly
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'Set (value hidden for security)' : 'Not set!'}`);
  
  try {
    // Create a new Prisma client with explicit datasource configuration
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Test the connection by running a simple query
    console.log('🔄 Attempting to connect to the database...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    console.log('✅ Database connection successful!');
    console.log('Query result:', result);
    
    // Close the connection
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
