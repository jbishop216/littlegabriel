// Script to directly set a user as admin using Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setUserAsAdmin(email) {
  try {
    console.log(`Setting user ${email} as admin...`);
    
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
    
    // Update the user role to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    console.log('✅ Success: User has been promoted to admin');
    console.log('User details:', updatedUser);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || 'jbishop216@gmail.com';
setUserAsAdmin(email);
