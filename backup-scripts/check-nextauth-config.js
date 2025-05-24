require('dotenv').config();

console.log('NextAuth Configuration Check:');
console.log('--------------------------');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set (value hidden)' : 'Not set (will use fallback)');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'Not set (defaults to deployment URL)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set (defaults to development)');
console.log('--------------------------');
console.log('Auth DB Connection:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden)' : 'Not set (using SQLite fallback)');
