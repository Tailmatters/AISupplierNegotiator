import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

// This is needed for Neon serverless driver
neonConfig.webSocketConstructor = ws

// Ensure database URL is available
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Database connections will fail.')
}

// Create a connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Configure connection pool for serverless environment
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema })

// Helper function to handle database errors with proper logging
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage = 'Database operation failed'
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw new Error(`${errorMessage}: ${error.message || 'Unknown error'}`)
  }
}

// Generic query function with error handling
export async function query<T>(
  queryFn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  return withErrorHandling(queryFn, errorMessage)
}