const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your new site password: ', async (password) => {
  try {
    // Generate a hash with salt rounds of 10
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('\nGenerated password hash:');
    console.log(hash);
    console.log('\nUpdate your .env file with:');
    console.log(`SITE_PASSWORD="${password}"`);
    console.log(`SITE_PASSWORD_HASH="${hash}"`);
  } catch (error) {
    console.error('Error generating hash:', error);
  } finally {
    rl.close();
  }
});