import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { WebSocket } from 'ws';
import * as schema from '@/schema';

// Configure WebSockets for Neon serverless
neonConfig.webSocketConstructor = WebSocket as any;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

// Handle connection errors (for debugging)
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});