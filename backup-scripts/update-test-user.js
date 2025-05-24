const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // First try to delete any existing users (clean slate)
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'TEST@example.com', 'Test@example.com']
        }
      }
    });
    
    // Create the test user with lowercase email
    const user = await prisma.user.create({
      data: {
        // Ensure email is lowercase to work with our SQLite query
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'user'
      }
    });
    
    console.log('Test user recreated successfully with lowercase email:', user);
  } catch (error) {
    console.error('Error recreating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
