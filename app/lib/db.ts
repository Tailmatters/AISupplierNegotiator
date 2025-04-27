import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  )
}

// Create a new pool instance with the connection string
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Create a Drizzle ORM instance with the pool and schema
export const db = drizzle(pool, { schema })

// Helper function to execute SQL queries
export async function executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const { rows } = await pool.query(sql, params)
    return rows as T[]
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}