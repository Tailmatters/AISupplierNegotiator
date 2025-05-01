import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import { eq } from "drizzle-orm"
import { users, type User } from "@/schema"
import type { InsertUser } from "@/schema"
import ws from "ws"

// Configure Neon Serverless with WebSocket support
neonConfig.webSocketConstructor = ws

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not defined")
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Drizzle client
export const db = drizzle(pool, { schema: { users } })

/**
 * Get a user by ID
 * @param id User ID
 * @returns User object or undefined if not found
 */
export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const results = await db.select().from(users).where(eq(users.id, id))
    return results[0]
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return undefined
  }
}

/**
 * Get a user by email
 * @param email User email
 * @returns User object or undefined if not found
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const results = await db.select().from(users).where(eq(users.email, email))
    return results[0]
  } catch (error) {
    console.error("Error getting user by email:", error)
    return undefined
  }
}

/**
 * Create a new user
 * @param userData User data to create
 * @returns Created user object
 */
export async function createUser(userData: InsertUser): Promise<User> {
  try {
    const results = await db.insert(users).values(userData).returning()
    return results[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw new Error("Failed to create user")
  }
}

/**
 * Update a user
 * @param id User ID to update
 * @param userData User data to update
 * @returns Updated user object
 */
export async function updateUser(id: number, userData: Partial<User>): Promise<User> {
  try {
    const results = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning()
    return results[0]
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error("Failed to update user")
  }
}

/**
 * Delete a user
 * @param id User ID to delete
 * @returns Deleted user object
 */
export async function deleteUser(id: number): Promise<User> {
  try {
    const results = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
    return results[0]
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}