const mongoose = require('mongoose');

async function run() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName: 'priviguard' });
    const usersCount = await conn.connection.collection('users').countDocuments();
    console.log(`Users in priviguard database: ${usersCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
run();
