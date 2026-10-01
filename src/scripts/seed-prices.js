import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { balloonsRepository } from '../repositories/balloons.repository.js';

(async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  const result = await balloonsRepository.randomizePrices();
  console.log(`Updated ${result.modifiedCount} balloons`);

  await client.close();
})();
