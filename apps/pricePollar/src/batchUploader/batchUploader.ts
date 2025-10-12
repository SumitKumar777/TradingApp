import { connectRedisClient } from "@repo/redisclient";
import {createClient} from "redis";
import pgPool from "@repo/timescaledb";

// interface TradeData{
//   name:string,
//   messages:
// }

export async function batchUploader() {
  const redisClient=createClient();
  await redisClient.connect();

  console.log("Batch uploader started");
  let lastId = "$";

  while (true) {
    const result = await redisClient.xRead(
      [{ key: "candleData2", id: lastId }],
      { BLOCK: 0, COUNT: 1 },
    );

    if (result ) {

      // @ts-ignore
      const resultData = result[0].messages[0];
      //@ts-ignore
       lastId=resultData.id;
      // @ts-ignore

      const parsedChartData = JSON.parse(resultData.message.payload);
      const data=parsedChartData.data.k;
      console.log(data,"data");

      // k: {
      //   t: 1760162340000,
      //     T: 1760162399999,
      //       s: 'BTCUSDT',
      //         i: '1m',
      //           f: 5317541780,
      //             L: 5317541942,
      //               o: '112442.02000000',
      //                 c: '112439.00000000',
      //                   h: '112442.03000000',
      //                     l: '112439.00000000',
      //                       v: '0.69193000',
      //                         n: 163,
      //                           x: false,
      //                             q: '77801.98588540',
      //                               V: '0.00088000',
      //                                 Q: '98.94898640',
      //                                   B: '0'
      // }
     

      if(data.x){

        const timestamp = data.t ? Number(data.t) : null;
        const query = `
INSERT INTO price_chart_data(
  time, symbol, interval, open, high, low, close, volume
) 
VALUES (
  to_timestamp($1 / 1000.0), $2, $3, $4, $5, $6, $7, $8
);
`;

        const values = [
          timestamp,
          data.s,
          data.i,
          Number(data.o),
          Number(data.h),
          Number(data.l),
          Number(data.c),
          Number(data.v)
        ];


        try {
          await pgPool.query(query, values);
          console.log("chart data added", data.k, data.c);
        } catch (error) {
          console.log("error in inserting the data timescale", error);
        }

      }
    }
  }
}
