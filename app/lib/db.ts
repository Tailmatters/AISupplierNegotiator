import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@/schema';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?',
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Helper function for transactions
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>,
): Promise<T> {
  return await pool.connect(async (connection) => {
    const tx = drizzle(connection, { schema });
    await connection.query('BEGIN');
    try {
      const result = await callback(tx);
      await connection.query('COMMIT');
      return result;
    } catch (e) {
      await connection.query('ROLLBACK');
      throw e;
    }
  });
}