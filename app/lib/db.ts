import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { eq } from 'drizzle-orm'
import * as schema from '@/schema'
import type { InsertUser, User } from '@/schema'
import ws from 'ws'

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws

// Check for environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create a new pool and client
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })

// User functions
export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1)
    
    return user
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)
    
    return user
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

export async function createUser(userData: InsertUser): Promise<User> {
  try {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .returning()
    
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
  try {
    const [updatedUser] = await db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning()
    
    return updatedUser
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const result = await db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning({ id: schema.users.id })
    
    return result.length > 0
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}