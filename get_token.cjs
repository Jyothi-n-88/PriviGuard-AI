const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await mongoose.connection.collection('users').findOne({ email: 'email2@test.com' });
  console.log(user.emailVerificationTokenHash);
  process.exit(0);
}
run();
