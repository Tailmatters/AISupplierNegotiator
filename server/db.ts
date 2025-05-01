import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from "../app/schema";
import { executeQuery } from '../app/lib/database-retry';
import ws from 'ws';
const { Pool } = pkg;

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a more resilient PostgreSQL connection pool
export const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,               // Maximum number of connections
  idleTimeoutMillis: 60000, // Increased idle timeout
  connectionTimeoutMillis: 30000, // Increased connection timeout
  ssl: {
    rejectUnauthorized: false // Important for Neon PostgreSQL
  }
});

// Add connection event listeners for better debugging
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  
  // Don't exit the application on connection errors, let the retry logic handle it
  if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
    console.warn('Non-fatal database connection error:', err.message);
  }
});

// Create a drizzle ORM instance using the connection pool and schema
export const db = drizzle(pool, { schema });

// Ping function to keep the database connection alive
let pingInterval: NodeJS.Timeout | null = null;
export function startKeepAlive() {
  // Stop any existing ping interval
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  // Set up a new ping interval
  pingInterval = setInterval(async () => {
    try {
      await executeQuery(async () => {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
          console.log('Database keep-alive ping successful');
        } finally {
          client.release();
        }
      });
    } catch (error) {
      console.error('Database keep-alive ping failed:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
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
    
    // Start the keep-alive pings after successful connection
    startKeepAlive();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Initialize database connection on module load
checkDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('Database connected and ready');
    } else {
      console.error('Database connection failed during initialization');
    }
  })
  .catch(err => {
    console.error('Error during database initialization:', err);
  });