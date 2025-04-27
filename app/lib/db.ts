import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/schema'
import ws from 'ws'

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws as any

// Check for DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Create Drizzle instance with the schema
export const db = drizzle(pool, { schema })