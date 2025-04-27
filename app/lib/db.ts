'use server'

import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/schema'
import ws from 'ws'

// Configure Neon for WebSocket
neonConfig.webSocketConstructor = ws

// Check if DATABASE_URL environment variable is present
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  )
}

// Create a pool for database connections
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
})

// Initialize Drizzle ORM with the database pool and schema
export const db = drizzle(pool, { schema })