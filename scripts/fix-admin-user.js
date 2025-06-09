// Script to check and fix admin user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('Checking for user accounts with email jbishop216@gmail.com (case insensitive)...');
    
    // Find all users with similar email (case insensitive)
    // Using toLowerCase for SQLite compatibility
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'jbishop216@gmail.com'.toLowerCase(),
        }
      }
    });
    
    // Filter results manually for case-insensitive match
    const filteredUsers = users.filter(user => 
      user.email.toLowerCase().includes('jbishop216@gmail.com'.toLowerCase())
    );
    
    console.log(`Found ${filteredUsers.length} matching accounts:`);
    filteredUsers.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
    });
    
    // Check if we have the exact lowercase version
    const exactUser = filteredUsers.find(u => u.email === 'jbishop216@gmail.com');
    
    if (exactUser) {
      console.log('\nFound exact match for jbishop216@gmail.com');
      
      // If user exists but is not admin, promote to admin
      if (exactUser.role !== 'admin') {
        console.log('User exists but is not admin. Promoting to admin role...');
        
        const updatedUser = await prisma.user.update({
          where: { id: exactUser.id },
          data: { role: 'admin' },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });
        
        console.log('✅ Success: User has been promoted to admin');
        console.log('Updated user details:', updatedUser);
      } else {
        console.log('✅ User already has admin role');
      }
    } else {
      // If we have a case-variant but not the exact lowercase one
      const caseVariantUser = filteredUsers.length > 0 ? filteredUsers[0] : null;
      
      if (caseVariantUser) {
        console.log(`\nFound case variant: ${caseVariantUser.email}`);
        console.log('Updating email to lowercase version and ensuring admin role...');
        
        const updatedUser = await prisma.user.update({
          where: { id: caseVariantUser.id },
          data: { 
            email: 'jbishop216@gmail.com',
            role: 'admin' 
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });
        
        console.log('✅ Success: User email updated and promoted to admin');
        console.log('Updated user details:', updatedUser);
      } else {
        console.log('\nNo matching user found. Creating new admin user...');
        // In a real script, you would hash the password, but for demo purposes we're using a placeholder
        console.log('⚠️ This is just a placeholder - in a real script we would create the user');
        console.log('⚠️ Please use the registration page to create a user first');
      }
    }
    
    // Final verification
    const finalCheck = await prisma.user.findFirst({
      where: {
        email: 'jbishop216@gmail.com',
        role: 'admin'
      }
    });
    
    if (finalCheck) {
      console.log('\n✅ VERIFICATION SUCCESSFUL: jbishop216@gmail.com exists with admin role');
    } else {
      console.log('\n❌ VERIFICATION FAILED: Could not confirm jbishop216@gmail.com with admin role');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
