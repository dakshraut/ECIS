const mongoose = require('mongoose');

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecis';

  try {
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`⚠️ MongoDB connection failed: ${error.message}`);
    console.warn('⚠️ Continuing without MongoDB. Start MongoDB or update MONGODB_URI to a reachable server.');
    return null;
  }
};

module.exports = connectDB;