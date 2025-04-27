import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from "ws"
import * as schema from "@/schema"

// Configure Neon PostgreSQL client
neonConfig.webSocketConstructor = ws

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable not set. Make sure you have a PostgreSQL database configured."
  )
}

// Create a connection pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
})

// Initialize drizzle with the pool and schema
export const db = drizzle(pool, { schema })

// Prepare statements for common database operations
export const dbOperations = {
  /**
   * Find a single record by ID
   * @param table The table to query
   * @param id The ID to look for
   * @returns The found record or undefined
   */
  async findById<T>(table: any, id: number): Promise<T | undefined> {
    const [record] = await db
      .select()
      .from(table)
      .where(table.id.equals(id))
      .limit(1)
    
    return record
  },
  
  /**
   * Find all records in a table
   * @param table The table to query
   * @returns Array of all records
   */
  async findAll<T>(table: any): Promise<T[]> {
    return await db.select().from(table)
  },
  
  /**
   * Insert a new record
   * @param table The table to insert into
   * @param data The data to insert
   * @returns The inserted record
   */
  async create<T>(table: any, data: any): Promise<T> {
    const [record] = await db
      .insert(table)
      .values(data)
      .returning()
    
    return record
  },
  
  /**
   * Update a record by ID
   * @param table The table to update
   * @param id The ID of the record to update
   * @param data The data to update
   * @returns The updated record
   */
  async update<T>(table: any, id: number, data: any): Promise<T | undefined> {
    const [record] = await db
      .update(table)
      .set(data)
      .where(table.id.equals(id))
      .returning()
    
    return record
  },
  
  /**
   * Delete a record by ID
   * @param table The table to delete from
   * @param id The ID of the record to delete
   * @returns The deleted record
   */
  async delete<T>(table: any, id: number): Promise<T | undefined> {
    const [record] = await db
      .delete(table)
      .where(table.id.equals(id))
      .returning()
    
    return record
  }
}