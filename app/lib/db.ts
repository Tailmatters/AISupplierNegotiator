import { Pool, neonConfig } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'
import * as schema from '@/schema'

// Using WebSockets for Neon serverless
neonConfig.webSocketConstructor = ws

// Environment validation
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is not set. Please set it to connect to the database.'
  )
}

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients to create
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // How long to wait for a new connection
})

// Create drizzle client
export const db = drizzle(pool, { schema })

// Export individual tables for convenience
export const {
  users,
  suppliers,
  negotiations,
  messages,
  invitations,
  contractTemplates,
  contracts,
  proposals,
  spendUploads,
  spendData,
  apiConnections,
  widgetTypes,
  dashboards,
  dashboardWidgets,
} = schema