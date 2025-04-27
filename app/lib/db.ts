import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/schema'
import ws from 'ws'
import { neonConfig } from '@neondatabase/serverless'

// Configure Neon serverless driver to use web sockets for Edge functions
neonConfig.webSocketConstructor = ws

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create connection pool
const pool = new Pool({ connectionString })

// Create drizzle database instance
export const db = drizzle(pool, { schema })