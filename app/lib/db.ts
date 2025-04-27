import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/schema'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'

// Check if database connection string is provided
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  )
}

// Configure WebSocket for Neon Serverless Pool
// @ts-ignore - the Node.js client needs 'ws' but WebSocket is available in browsers
if (typeof window === 'undefined') {
  // Set WebSocket implementation for Node.js environment
  const ws = require('ws')
  // @ts-ignore (we need to set this for Node but TS doesn't like it)
  neon.websocketConstructor = ws
}

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Initialize Drizzle ORM with the pool and schema
export const db = drizzle(pool, { schema })

// Utility function to execute raw SQL queries
export async function query(sql: string, params: any[] = []) {
  const client = await pool.connect()
  try {
    const result = await client.query(sql, params)
    return result
  } finally {
    client.release()
  }
}

// Ping database to check connection
export async function checkDatabaseConnection() {
  try {
    const result = await query('SELECT NOW()')
    return { connected: true, timestamp: result.rows[0].now }
  } catch (error) {
    console.error('Database connection error:', error)
    return { connected: false, error: error.message }
  }
}

// Gracefully close database connections on shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down DB connection pool...')
  await pool.end()
})

export { schema }