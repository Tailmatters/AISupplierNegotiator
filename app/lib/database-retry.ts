import { backOff } from 'exponential-backoff';
import { Pool } from '@neondatabase/serverless';

let isWakingUpPool = false;
let wakeupPromise: Promise<void> | null = null;

/**
 * Utility to retry database operations with exponential backoff
 * This helps handle transient database connection issues in Neon Postgres
 * @param operation The database operation to attempt
 * @param maxRetries Maximum number of retry attempts (default: 5)
 * @returns Result of the database operation
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  return backOff(
    async () => {
      try {
        return await operation();
      } catch (error: any) {
        // Check if the error is a "endpoint is disabled" error, which is retriable
        if (error?.message?.includes('endpoint is disabled')) {
          console.warn('Database endpoint is disabled, attempting to wake up the endpoint...');
          await wakeUpNeonEndpoint();
          throw error; // Rethrow to trigger backoff
        }
        
        // For other database connection errors that might be retriable
        if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT' || 
           error?.code === 'XX000') {
          console.warn(`Database connection error (${error.code}), retrying...`);
          throw error; // Rethrow to trigger backoff
        }
        
        // For any other errors, don't retry
        throw error;
      }
    },
    {
      numOfAttempts: maxRetries,
      startingDelay: 500,  // Increased starting delay
      timeMultiple: 2,
      maxDelay: 10000,     // Increased max delay
      retry: (error: Error, attemptNumber: number) => {
        console.warn(`Database operation failed (attempt ${attemptNumber}/${maxRetries}):`, error.message);
        return true;
      },
    }
  );
}

/**
 * Special function to wake up a dormant Neon PostgreSQL endpoint
 * This creates a temporary connection that will activate the endpoint
 */
async function wakeUpNeonEndpoint(): Promise<void> {
  // If we're already trying to wake up the endpoint, wait for that to complete
  if (isWakingUpPool) {
    if (wakeupPromise) {
      await wakeupPromise;
      return;
    }
  }

  console.log("Attempting to wake up Neon PostgreSQL endpoint...");
  isWakingUpPool = true;
  
  // Create a promise that we can await and track
  wakeupPromise = new Promise<void>(async (resolve, reject) => {
    try {
      // Create a temporary pool with a short connection timeout
      const tempPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 30000, // 30 seconds
      });
      
      // Attempt a simple query to wake up the endpoint
      for (let attempts = 1; attempts <= 3; attempts++) {
        try {
          console.log(`Wake-up attempt ${attempts} of 3...`);
          await tempPool.query('SELECT 1');
          console.log("Neon PostgreSQL endpoint is now active!");
          break;
        } catch (err: any) {
          if (attempts === 3) {
            console.error("Failed to wake up Neon PostgreSQL endpoint after 3 attempts:", err.message);
            throw err;
          }
          console.log(`Wake-up attempt ${attempts} failed, waiting before retry...`);
          await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds between attempts
        }
      }
      
      // End the temporary pool
      await tempPool.end();
      resolve();
    } catch (error) {
      console.error("Error during database wake-up:", error);
      reject(error);
    } finally {
      isWakingUpPool = false;
      wakeupPromise = null;
    }
  });
  
  return wakeupPromise;
}

/**
 * Execute a database operation with retry logic
 * This is a convenience wrapper for withDatabaseRetry
 * @param operation The database operation to execute
 * @returns Result of the database operation
 */
export async function executeQuery<T>(operation: () => Promise<T>): Promise<T> {
  return withDatabaseRetry(operation, 5);
}