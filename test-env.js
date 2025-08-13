require('dotenv/config');

console.log('=== Testing Environment Variables ===');
console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('DATABASE_USER:', process.env.DATABASE_USER);
console.log('DATABASE_PASSWORD:', process.env.DATABASE_PASSWORD);
console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('===============================');
