import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

import fs from "fs";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
// TIMESCALE_USER = timescaleuser
// TIMESCALE_PASSWORD = timescalepassword
// TIMESCALE_DB = postgres
// TIMESCALE_HOST = localhost
// TIMESCALE_PORT = 5433

const createPgPool = () =>
  new Pool({
    user: "timescaleuser",
    host: "localhost",
    database: "postgres",
    password: "timescalepassword",
    port: 5433,
    max: 10,
    idleTimeoutMillis: 30000,
  });

declare global {
  var pgPoolGlobal: undefined | ReturnType<typeof createPgPool>;
}

const pgPool: ReturnType<typeof createPgPool> =
  globalThis.pgPoolGlobal ?? createPgPool();

export default pgPool;

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPoolGlobal = pgPool;
}

let schemaInitialized = false;

async function initSchema() {
  if (schemaInitialized) return;
  let client;
   const schemaPath = path.join(__dirname, "../src/schema/001_create_schema.sql");

  const sql = fs.readFileSync(schemaPath, "utf8");
  try {
    client = await pgPool.connect();
    console.log("client connected in timescaledb");
    await client.query(sql);
     await client.query(`CALL refresh_continuous_aggregate('five_min_ohlc', NULL, NULL)`);
     await client.query(`CALL refresh_continuous_aggregate('fifteen_min_ohlc', NULL, NULL)`);

    schemaInitialized = true;
    console.log("Schema initialized successfully");
  } catch (error) {
    console.log("error in initializing the schema", error);
  } finally {
    if (client) {
      client.release();
    }
  }
}

(async () => {
  await initSchema();
})();
