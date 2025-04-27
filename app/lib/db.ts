import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

// This is needed for WebSocket connections (for pooling)
neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable must be set')
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })