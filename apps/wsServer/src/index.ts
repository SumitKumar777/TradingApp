import { createClient, RedisClientType } from "redis";
import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";
import path from "path";
import url from "url";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";


const redisPublisher: RedisClientType = createClient();
const redisConsumer: RedisClientType = createClient();


const userSocketMap = new Map<string, WebSocket>();
const activeSockets = new Set<WebSocket>();


function authenticateUser(reqUrl?: string): { success: boolean; data?: JwtPayload } {
  try {
    if (!reqUrl) throw new Error("Missing request URL");

    const token = url.parse(reqUrl, true).query.token as string | undefined;
    if (!token) throw new Error("Token not found");

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return { success: true, data: decoded };
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      console.error("JWT Authentication error:", error.message);
    } else {
      console.error("Error parsing token:", error);
    }
    return { success: false };
  }
}


function startWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws, req) => {
    const authResult = authenticateUser(req.url);

    if (!authResult.success || !authResult.data?.id) {
      ws.send("Unauthorized Access");
      ws.close(1008, "Unauthorized");
      return;
    }

    const userId = authResult.data.id;


    const oldSocket = userSocketMap.get(userId);
    if (oldSocket) activeSockets.delete(oldSocket);

    userSocketMap.set(userId, ws);
    activeSockets.add(ws);

    ws.on("message", (data) => {
      console.log("Received from client:", data.toString());
    });

    ws.on("close", () => {
      activeSockets.delete(ws);
      userSocketMap.delete(userId);
      console.log(`User ${userId} disconnected`);
    });

    ws.on("error", (err) => console.error("WebSocket error:", err));

    ws.send("Connected to server ");
  });

  console.log("WebSocket Server started on port 8080");
  return wss;
}


async function startRedisSubscriptions() {
  await redisPublisher.connect();
  console.log("Redis publisher connected");

  await redisPublisher.subscribe("bitcoin", (message) => {
    broadcastToAll({ type: "tokenPrice", message });
  });

  await redisPublisher.subscribe("candlePriceChartData", (message) => {
    broadcastToAll({ type: "chartData", message });
  });
}

function broadcastToAll(payload: any) {
  const data = JSON.stringify(payload);
  activeSockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  });
}


async function startUpdatedOrderListener() {
  await redisConsumer.connect();
  console.log("Redis consumer connected");

  while (true) {
    const response = await redisConsumer.xRead([{ key: "orders:updated", id: "$" }], {
      BLOCK: 0,
      COUNT: 1,
    });

    if (!response) continue;
    // @ts-ignore
    const message = response[0].messages[0].message as any;
    const userId = message.userId;

    const userSocket = userSocketMap.get(userId);
    if (userSocket && userSocket.readyState === WebSocket.OPEN) {
      userSocket.send(JSON.stringify({ type: "orderUpdate", order: message }));
    }
  }
}


async function main() {
  startWebSocketServer();
  await startRedisSubscriptions();
  startUpdatedOrderListener();
  console.log("✅ WebSocket + Redis system is up and running!");
}

main().catch(console.error);
