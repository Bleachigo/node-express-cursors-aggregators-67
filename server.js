import { app } from './app.js';
import { connectMongo } from './src/config/mongodb.config.js';

const port = process.env.PORT;

try {
  await connectMongo();

  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`),
  );
} catch (error) {
  console.error('Failed to start the server:', error);

  process.exitCode = 1;
}
