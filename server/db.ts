import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from "../app/schema";
import { backOff } from 'exponential-backoff';
const { Pool } = pkg;

// Create a PostgreSQL connection pool with improved settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,               // Maximum number of connections
  idleTimeoutMillis: 30000, // How long a connection can be idle before being removed
  connectionTimeoutMillis: 5000, // How long to wait for a connection
});

// Add connection event listeners for better debugging
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Create a drizzle ORM instance using the connection pool and schema
export const db = drizzle(pool, { schema });

/**
 * Enhanced query function with retry logic for database operations
 * @param queryFn Function that performs the database query
 * @returns Result of the database query
 */
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  return backOff(
    async () => {
      try {
        return await queryFn();
      } catch (error: any) {
        // Check if the error is a "endpoint is disabled" error, which is retriable
        if (error?.message?.includes('endpoint is disabled')) {
          console.warn('Database endpoint is disabled, retrying...');
          throw error; // Rethrow to trigger backoff
        }
        
        // For other database connection errors that might be retriable
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || 
            error?.code === 'XX000') {
          console.warn(`Database connection error (${error.code}), retrying...`);
          throw error; // Rethrow to trigger backoff
        }
        
        // For any other errors, don't retry
        throw error;
      }
    },
    {
      numOfAttempts: 5,
      startingDelay: 200,
      timeMultiple: 2,
      maxDelay: 5000,
      retry: (error: any, attemptNumber) => {
        console.warn(`Database operation failed (attempt ${attemptNumber}/5):`, error.message);
        return true;
      },
    }
  );
}

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await executeQuery(async () => {
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