const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.CLOUD_MONGODB_URI || process.env.LOCAL_MONGODB_URI;

    if (!uri) {
      throw new Error("No MongoDB connection URI found in environment variables.");
    }

    const conn = await mongoose.connect(uri);
    console.log(`🟢 Connected to Cloud MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`🔴 MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;