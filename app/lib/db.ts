import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

// Configure the WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  )
}

// Create a connection pool to the database
export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Create a Drizzle ORM instance with the schema
export const db = drizzle(pool, { schema })

// Helper functions for common database operations
export async function getUserByUsername(username: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where((users) => users.username === username)
  
  return user
}

export async function getUserById(id: number) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where((users) => users.id === id)
  
  return user
}

export async function createUser(userData: schema.InsertUser) {
  const [user] = await db
    .insert(schema.users)
    .values(userData)
    .returning()
  
  return user
}

// Transaction helper
export async function transaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return pool.connect(async (connection) => {
    const tx = drizzle(connection, { schema })
    await connection.query('BEGIN')
    try {
      const result = await callback(tx)
      await connection.query('COMMIT')
      return result
    } catch (error) {
      await connection.query('ROLLBACK')
      throw error
    }
  })
}