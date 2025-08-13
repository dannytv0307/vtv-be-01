const path = require('path');
const fs = require('fs');

console.log('=== Debug Environment File ===');
console.log('Current directory:', process.cwd());

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
console.log('Looking for .env at:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('File size:', fs.statSync(envPath).size, 'bytes');
  console.log('First few lines:');
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n').slice(0, 5);
  lines.forEach((line, i) => console.log(`${i + 1}: ${line}`));
}

// Try to load with dotenv
console.log('\n=== Loading with dotenv ===');
require('dotenv/config');

console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
console.log('DATABASE_USER:', process.env.DATABASE_USER);
console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
