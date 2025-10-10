import type {RedisClientType} from "redis";
import { createClient } from "redis";

let redisClient: RedisClientType;

export async function connectRedisClient(): Promise<RedisClientType> {
   if (!redisClient) {
      redisClient = createClient();

      redisClient.on("error", (err) => console.error("Redis error:", err));
      await redisClient.connect();
      console.log("Redis successfully connected");
   }

   return redisClient;
}
