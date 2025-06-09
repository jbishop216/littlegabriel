// Script to check user details
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser(email) {
  try {
    console.log(`Checking user ${email}...`);
    
    // Find the user by email (case insensitive search)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          contains: email.toLowerCase(),
        },
      },
    });
    
    if (!user) {
      console.error(`❌ Error: User with email ${email} not found`);
      return;
    }
    
    console.log('User details:', user);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || 'jbishop216@gmail.com';
checkUser(email);
