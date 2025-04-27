import { neon, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/schema'
import ws from 'ws'

// Configure neon to use WebSockets in edge runtime
neonConfig.webSocketConstructor = ws as any

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please set it in your .env file.'
  )
}

// Create a Neon client
const sql = neon(process.env.DATABASE_URL)

// Create a Drizzle client
export const db = drizzle(sql, { schema })