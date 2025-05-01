import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@/schema";

// Configure Neon database to use WebSockets in edge and serverless environments
neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create connection pool and drizzle instance
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000 // Add timeout for connections
});

// Create drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });

// Simple function to test the database connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log("Database connection successful:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}