import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

neonConfig.webSocketConstructor = ws

// Cache the connection
let pool: Pool
let db: ReturnType<typeof drizzle<typeof schema>>

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return pool
}

export function getDb() {
  if (!db) {
    db = drizzle(getPool(), { schema })
  }
  return db
}