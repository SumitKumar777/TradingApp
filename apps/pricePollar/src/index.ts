import { WebSocket } from "ws";
import { connectRedisClient } from "@repo/redisclient";
import { batchUploader } from "./batchUploader/batchUploader";

async function main() {
  const redisClient = await connectRedisClient();
  console.log("Redis connected");
  batchUploader();
  console.log("Batch uploader started");

  const binanceWs = new WebSocket("wss://stream.binance.com:9443/stream");

  const binanceChartData = new WebSocket(
    "wss://fstream.binance.com/stream?streams=btcusdt@kline_1m",
  );

  binanceWs.on("error", (err) => console.error("Binance WS error:", err));
  binanceWs.on("close", (code, reason) =>
    console.log("Binance WS closed:", code, reason.toString()),
  );

  binanceChartData.on("open", () => {
    console.log("Connected to Binance chart WS");
  });

  binanceChartData.on("error", (err) =>
    console.error("Binance chart WS error:", err),
  );
  binanceChartData.on("close", (code, reason) =>
    console.log("Binance chart WS closed:", code, reason.toString()),
  );

  binanceWs.on("open", () => {
    console.log("Connected to Binance");

    binanceWs.send(
      JSON.stringify({
        method: "SUBSCRIBE",
        params: ["btcusdt@aggTrade"],
        id: 1,
      }),
    );
    console.log("Sent subscription request for btcusdt@aggTrade");
  });

  binanceWs.on("message", async (data) => {
   //  console.log("Received aggTrade message", data.toString());

    const price = JSON.parse(data.toString()).data;

    await redisClient.publish("bitcoin", data.toString());
  });

  binanceChartData.on("message", async (data) => {
   //  console.log("received message on the binance chart", data.toString());

    try {
       const subData=await redisClient.publish("candlePriceChartData", data.toString());

       console.log(subData,"subData");

       try {
          const id = await redisClient.xAdd("candleData2", "*", {
             payload: data.toString(),
          });
          console.log("Added to Redis stream candleData with ID:", id);
       } catch (err) {
          console.error("Failed to xAdd:", err);
       }
    } catch (error) {
      console.log("error in the pricePollar sub",error);
    }
  });
}

main().catch(console.error);
