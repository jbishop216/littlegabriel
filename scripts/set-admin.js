// Script to set a user as admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Looking for users in the system...');
    
    // Get all users to see what we're working with
    const allUsers = await prisma.user.findMany();
    console.log('All users:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
    
    // Find the user with email jbishop216@gmail.com or JBishop216@gmail.com
    const targetEmail = 'jbishop216@gmail.com'.toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === targetEmail);
    
    if (!user) {
      console.log('User not found with email matching jbishop216@gmail.com');
      return;
    }
    
    console.log(`Found user: ${user.email} (${user.id}) with role: ${user.role}`);
    
    // Update user to admin role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    });
    
    console.log(`Updated user to admin role: ${updatedUser.email} (${updatedUser.id}) with new role: ${updatedUser.role}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
