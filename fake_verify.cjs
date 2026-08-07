const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const token = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await mongoose.connection.collection('users').updateOne(
    { email: 'email2@test.com' },
    { $set: { emailVerificationTokenHash: hash, emailVerificationExpiresAt: new Date(Date.now() + 1000 * 60 * 15) } }
  );
  console.log("Token:", token);
  process.exit(0);
}
run();
