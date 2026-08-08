const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  if (!process.env.MONGODB_URI) {
    console.log("No MONGODB_URI found.");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected DB Name:", conn.connection.name);
    console.log("Connected Host:", conn.connection.host);
    const usersCount = await conn.connection.collection('users').countDocuments();
    console.log("Users in default db:", usersCount);
    
    // Switch to priviguard if not already
    const priviguardDb = conn.connection.useDb('priviguard');
    const priviUsersCount = await priviguardDb.collection('users').countDocuments();
    console.log("Users in priviguard db:", priviUsersCount);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
run();
