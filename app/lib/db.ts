import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

// Configure Neon connection
neonConfig.webSocketConstructor = ws

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Create a Drizzle instance
export const db = drizzle(pool, { schema })

// Connection helper for testing database connectivity
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()')
    return { success: true, timestamp: result.rows[0].now }
  } catch (error: any) {
    console.error('Database connection error:', error)
    return { success: false, error: error.message }
  }
}

// User operations for the database
export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(schema.users).where(
    (users) => users.email === email
  ).execute()
  
  return user
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(schema.users).where(
    (users) => users.id === id
  ).execute()
  
  return user
}

export async function createUser(userData: schema.InsertUser) {
  const [user] = await db.insert(schema.users)
    .values(userData)
    .returning()
    .execute()
  
  return user
}