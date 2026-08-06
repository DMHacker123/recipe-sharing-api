// Fix for local dev: some networks/ISPs block the DNS SRV lookup that
// mongodb+srv:// connection strings rely on, causing ECONNREFUSED errors.
// Forcing Google's public DNS servers resolves it. Safe to leave in for
// everyone — it only overrides DNS resolution for this Node process,
// doesn't affect your system DNS, and won't cause issues on Render.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);



const { MongoClient } = require('mongodb');

let client;
let database;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI);

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

const closeDB = async () => {
  if (client) {
    await client.close();
  }
};

module.exports = {
  connectDB,
  getDB,
  closeDB
};