import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@/schema';

// Configure WebSocket for Neon Postgres
neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 seconds
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed (30 seconds)
  ssl: true,
});

// Handle pool errors globally to prevent the app from crashing
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Function to test database connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Successfully connected to database');
    return true;
  } catch (err) {
    console.error('Error connecting to database:', err);
    return false;
  }
}

// Export pool for direct queries if needed
export { pool };