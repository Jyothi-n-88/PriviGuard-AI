import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI environment variable is not defined.');
    console.warn('⚠️ Skipping MongoDB connection for this environment. Real database functionality will not work until this is configured.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
    // We don't exit the process here so that the app still boots and shows error gracefully
  }
};
