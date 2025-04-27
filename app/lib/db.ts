import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from '@/schema'
import ws from 'ws'

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws

// Check for the DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please set it in your .env file or environment variables.'
  )
}

// Create a connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Set max connection pool size with sensible defaults
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
})

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema })

// Utility function to get a direct client for transactions
export async function getClient() {
  return await pool.connect()
}

// Function to test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}