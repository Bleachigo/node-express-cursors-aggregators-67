import 'dotenv/config';
import { connectMongo, closeMongo } from '../config/mongodb.config.js';
import { balloonsRepository } from '../repositories/balloons.repository.js';

try {
  await connectMongo();

  const result = await balloonsRepository.randomizePrices();
  console.log(`Updated ${result.modifiedCount} balloons`);
} catch (error) {
  console.error(error);
} finally {
  await closeMongo();
}
