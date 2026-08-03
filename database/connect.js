const { MongoClient } = require('mongodb');

let database;

const connectDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);

    await client.connect();

    database = client.db('recipe-sharing-api');

    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!database) {
    throw new Error('Database not initialized');
  }

  return database;
};

module.exports = {
  connectDB,
  getDB
};