import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

// Required for Neon database connection with WebSockets
neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20,
})

// Create a database instance with the schema
export const db = drizzle(pool, { schema })

// Export a function to close the connection pool
export async function closePool() {
  await pool.end()
}

// Handle database errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err)
  // Don't crash on connection error, but log it
})

// Export the pool for use in other files (like for transactions)
export { pool }