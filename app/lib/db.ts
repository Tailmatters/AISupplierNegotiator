import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from '@/schema';
import { withDatabaseRetry } from './database-retry';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the connection pool with better defaults for Neon serverless
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,               // Maximum number of connections
  idleTimeoutMillis: 30000, // How long a connection can be idle before being removed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
  maxUses: 10000,          // How many times a connection can be used before being closed
});

// Add connection event listeners for better debugging
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Create a Drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });

/**
 * Enhanced query function with retry logic for database operations
 * @param queryFn Function that performs the database query
 * @returns Result of the database query
 */
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  return withDatabaseRetry(queryFn);
}

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await withDatabaseRetry(async () => {
      const client = await pool.connect();
      try {
        await client.query('SELECT 1');
        console.log('Database connection successful');
      } finally {
        client.release();
      }
    });
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}