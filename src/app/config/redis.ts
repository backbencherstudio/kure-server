import { createClient } from 'redis';
import dotenv from 'dotenv';
 

dotenv.config();

export const redisClient = createClient({
  url: process.env.radisUrl
});


redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis...");
    // await redisClient.flushAll();
  } catch (error) {
    console.error("Redis connection error:", error);
    process.exit(1);
  }
};