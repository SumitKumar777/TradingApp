
import { Pool } from "pg";

import dotenv from "dotenv";

dotenv.config();

const createPgPool = () =>
   new Pool({
      user: process.env.TIMESCALE_USER,
      host: process.env.TIMESCALE_HOST,
      database: process.env.TIMESCALE_DB,
      password: process.env.TIMESCALE_PASSWORD,
      port: Number(process.env.TIMESCALE_PORT) || 5432,
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
