import { MongoClient } from 'mongodb';
import 'dotenv/config';

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export const connectMongo = async () => {
  await client.connect();

  db = client.db(process.env.MONGODB_DB_NAME);

  await db.command({ ping: 1 });

  console.log('MongoDB connected successfully');
};

export const getCollection = (collectionName) => {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }

  return db.collection(collectionName);
};

export const closeMongo = async () => {
  await client.close();
  db = undefined;
};
