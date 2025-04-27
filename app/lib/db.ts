import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from '@/schema'

// Check that database URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Create a Drizzle client
export const db = drizzle(sql, { schema })

// Helper functions for database operations
export async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error('Database error:', error)
    throw new Error('Database operation failed')
  }
}