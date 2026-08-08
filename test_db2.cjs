const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const users = await conn.connection.collection('users').find({}).toArray();
    console.log("Users in default db:");
    users.forEach(u => console.log(`- ID: ${u._id}, Email: ${u.email}, Role: ${u.role}, DPO?: ${u.role === 'dpo'}`));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
run();
