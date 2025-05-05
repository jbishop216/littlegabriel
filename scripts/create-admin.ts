import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@littlegabriel.com';
  const adminPassword = 'AdminPassword123!';
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      },
    });
    
    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();