import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let pool: Pool;

if (!global.pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  global.pool = pool;
} else {
  pool = global.pool;
}

export const db = drizzle(pool, { schema });

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('error executing query', { text, err });
    throw err;
  }
}