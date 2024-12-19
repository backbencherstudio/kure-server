import app from './app';
import config from './app/config';
import mongoose from 'mongoose';
import { connectRedis } from './app/config/redis';

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    await connectRedis()
    app.listen(config.port, () => {
      console.log(`Example app listening on PORT === ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
main();
