import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { WebSocket } from 'ws';
import * as schema from '@/schema';

// Use WebSockets for Neon serverless driver
neonConfig.webSocketConstructor = WebSocket as any;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create a drizzle instance
export const db = drizzle(pool, { schema });

// Export types for better type safety
export type DbClient = typeof db;
export type Schema = typeof schema;