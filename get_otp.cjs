const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await mongoose.connection.collection('users').findOne({ email: 'otp@test.com' });
  const hash = user.emailVerificationOtpHash;
  for(let i=0; i<1000000; i++) {
    const otp = i.toString().padStart(6, '0');
    if (crypto.createHash('sha256').update(otp).digest('hex') === hash) {
      console.log("Found OTP:", otp);
      break;
    }
  }
  process.exit(0);
}
run();
