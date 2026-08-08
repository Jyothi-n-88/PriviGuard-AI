const mongoose = require('mongoose');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.log("No MONGODB_URI found.");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    const dbName = conn.connection.name;
    const usersCollection = conn.connection.collection('users');
    
    const allUsersBefore = await usersCollection.countDocuments();
    console.log(`Connected DB Name: ${dbName}`);
    console.log(`Total users before deletion: ${allUsersBefore}`);
    
    // Find users that have a 'role' or 'organizationId' field (PriviGuard specific)
    const filter = { $or: [ { role: { $exists: true } }, { organizationId: { $exists: true } } ] };
    const priviUsers = await usersCollection.countDocuments(filter);
    console.log(`PriviGuard users to delete: ${priviUsers}`);
    
    if (priviUsers > 0) {
      const result = await usersCollection.deleteMany(filter);
      console.log(`Deleted ${result.deletedCount} PriviGuard users.`);
    }
    
    const allUsersAfter = await usersCollection.countDocuments();
    console.log(`Total users remaining (from other projects): ${allUsersAfter}`);
    
    // Also clear organizations just in case
    const orgsCollection = conn.connection.collection('organizations');
    const orgsCount = await orgsCollection.countDocuments();
    if (orgsCount > 0) {
      await orgsCollection.deleteMany({});
      console.log(`Deleted ${orgsCount} organizations.`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
run();
