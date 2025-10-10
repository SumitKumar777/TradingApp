import type {RedisClientType} from  "redis";
import { createClient  } from "redis";



export const redisClient:RedisClientType= createClient();

export async function connectRedisClient():Promise<void>{

   await redisClient.connect();

   console.log("redis is successfully connected");
}

redisClient.on("error",()=>{
   console.log("error in redisclient")
})




