import { createClient } from "redis";
import { WebSocketServer } from "ws";

const wbClient = createClient();

function startWebsocketSever() {
  const wssServer = new WebSocketServer({ port: 8080 });

  wssServer.on("error", () => console.log("error"));

  wssServer.on("connection", (ws) => {
    ws.on("error", () => console.log("error in websocket client connection "));

    ws.on("message", (data) => {
      console.log("received message on websocket", data.toString());
    });

    ws.send("HI From the server");
  });

  return wssServer;
}

async function startRedis(wss: any): Promise<void> {
  await wbClient.connect();

  console.log("redis connected");

  await wbClient.subscribe("bitcoin", (message) => {
    wss.clients.forEach((clt: WebSocket) => {
      if (clt.readyState === WebSocket.OPEN) {
        clt.send(
          JSON.stringify({
            type: "tokenPrice",
            message,
          }),
        );
      }
    });
  });
  await wbClient.subscribe("candlePriceChartData", (message) => {
    wss.clients.forEach((clt: WebSocket) => {
      if (clt.readyState === WebSocket.OPEN) {
        clt.send(
          JSON.stringify({
            type: "chartData",
            message,
          }),
        );
      }
    });
  });
}

async function main() {
  const wss = startWebsocketSever();

  await startRedis(wss);
  console.log("Websocket and redis are ready to use");
}

main().catch(console.error);
