import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import ws from 'ws'
import * as schema from '@/schema'

// Required for Neon serverless
neonConfig.webSocketConstructor = ws

// Database connection configuration
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Singleton pattern to ensure we only create one database connection
let _pool: Pool | null = null
let _db: ReturnType<typeof drizzle> | null = null

export function getPool() {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return _pool
}

export function getDb() {
  if (!_db) {
    const pool = getPool()
    _db = drizzle(pool, { schema })
  }
  return _db
}

// For use in server components and API routes
export async function executeQuery<T = any>(
  queryFn: (db: ReturnType<typeof drizzle>) => Promise<T>
): Promise<T> {
  const db = getDb()
  try {
    return await queryFn(db)
  } catch (error) {
    console.error('Database query failed:', error)
    throw error
  }
}

// This should be run in a migration script, not in the application code
export async function runMigrations() {
  const pool = getPool()
  const db = drizzle(pool)
  
  try {
    console.log('Running migrations...')
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}