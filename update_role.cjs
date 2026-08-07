const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    await mongoose.connection.collection('users').updateOne({ email: 'admin@test.com' }, { $set: { role: 'admin' } });
    console.log('Role updated');
  } catch (e) {
    console.log(e.message);
  }
  process.exit(0);
}
fix();
