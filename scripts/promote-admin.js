// Script to promote a user to admin role
const fetch = require('node-fetch');

async function promoteToAdmin(email) {
  try {
    console.log(`Promoting user ${email} to admin role...`);
    
    const response = await fetch('http://localhost:3000/api/admin/promote-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success:', data.message);
      console.log('User details:', data.user);
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || 'jbishop216@gmail.com';
promoteToAdmin(email);
