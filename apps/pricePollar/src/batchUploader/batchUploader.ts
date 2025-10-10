import { connectRedisClient } from "@repo/redisclient";
import pgPool from "@repo/timescaledb";


export async function batchUploader() {
   const redisClient=await connectRedisClient();

   console.log("Batch uploader started");
   let lastId = "0-0"; 

   while (true) {
      const result = await redisClient.xRead(
         [{ key: "candleData", id: lastId }],
         { BLOCK: 0, COUNT: 1 }
      );

      if (result) {
         console.log(result,"result in ");
      }
   }
}
