import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { WebSocket } from 'ws'
import * as schema from '@/schema'

// Configure neon for Vercel environment
neonConfig.webSocketConstructor = WebSocket

// Environment validation
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?'
  )
}

// Database connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Default connection pool configuration
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a connection to become available
  allowExitOnIdle: false, // Allow the pool to exit if all clients disconnect
})

// Drizzle ORM instance
export const db = drizzle(pool, { schema })

/**
 * Execute a transaction within a single client from the pool
 * @param callback - Transaction callback with the Drizzle instance
 * @returns Result of the transaction callback
 */
export async function transaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const tx = drizzle(client, { schema })
    const result = await callback(tx)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

/**
 * Health check function for the database connection
 * @returns True if the database is connected, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = await pool.connect()
    try {
      await client.query('SELECT 1')
      return true
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}