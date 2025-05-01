import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@/schema';

// Configure Neon to use WebSockets in environments like Vercel
neonConfig.webSocketConstructor = ws;

// Ensure we have a DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a Drizzle ORM instance with all our schema tables
export const db = drizzle(pool, { schema });

// Export the pool in case we need direct access
export { pool };