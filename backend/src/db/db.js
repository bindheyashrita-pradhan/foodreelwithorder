const mongoose = require('mongoose');

function connectDB() {
  // 1. Connect to Local MongoDB
  const localDb = mongoose.createConnection(process.env.LOCAL_MONGODB_URI);

  localDb.on('connected', () => {
    console.log('🟢 Connected to LOCAL MongoDB');
  });

  localDb.on('error', (err) => {
    console.error('🔴 Local MongoDB connection error:', err);
  });

  // 2. Connect to Cloud MongoDB Atlas
  const cloudDb = mongoose.createConnection(process.env.CLOUD_MONGODB_URI);

  cloudDb.on('connected', () => {
    console.log('☁️ Connected to CLOUD MongoDB Atlas');
  });

  cloudDb.on('error', (err) => {
    console.error('🔴 Cloud MongoDB connection error:', err);
  });

  return { localDb, cloudDb };
}

module.exports = connectDB;