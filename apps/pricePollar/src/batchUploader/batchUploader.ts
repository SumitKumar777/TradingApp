import pgPool from "@repo/timescaledb";
import { redisClient } from "@repo/redisclient";

export async function batchUploader() {
   console.log("Batch uploader started");
   let lastId = "0-0"; 

   while (true) {
      const result = await redisClient.xRead(
         [{ key: "newChartData", id: lastId }],
         { BLOCK: 0, COUNT: 1 }
      );

      if (result) {
         for (const stream of result) {
            for (const message of stream.messages) {
               console.log("Received message:", message.message.payload);
               lastId = message.id; 
            }
         }
      }
   }
}
