import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@/schema';

// Enable WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable not found. Please make sure it is set.'
  );
}

// Create a connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a Drizzle ORM client with our schema
export const db = drizzle(pool, { schema });

// Helper function to execute raw SQL queries
export async function executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await pool.query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}