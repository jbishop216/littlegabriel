const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create the test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        name: 'Test User',
        password: hashedPassword,
        role: 'user'
      },
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'user'
      }
    });
    
    console.log('Test user created successfully:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
