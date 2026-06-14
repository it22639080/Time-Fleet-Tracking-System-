const mongoose = require('mongoose');

const { env } = require('./env');

async function connectMongoDB() {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  await mongoose.connect(env.mongoUri);
}

module.exports = { connectMongoDB };
