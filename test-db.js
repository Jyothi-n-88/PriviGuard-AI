import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("NO_URI");
  process.exit(0);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("PASS");
    process.exit(0);
  })
  .catch((err) => {
    console.log("FAIL: " + err.name + " - " + err.message);
    process.exit(1);
  });
