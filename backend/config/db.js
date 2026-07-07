const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifelink';
  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI not set. Falling back to local mongodb://127.0.0.1:27017/lifelink');
  }
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
