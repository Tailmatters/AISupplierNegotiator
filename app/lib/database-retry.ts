import { backOff } from 'exponential-backoff';

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
      } catch (error) {
        // Check if the error is a "endpoint is disabled" error, which is retriable
        if (error?.message?.includes('endpoint is disabled')) {
          console.warn('Database endpoint is disabled, retrying...');
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
      startingDelay: 200,
      timeMultiple: 2,
      maxDelay: 5000,
      retry: (error, attemptNumber) => {
        console.warn(`Database operation failed (attempt ${attemptNumber}/${maxRetries}):`, error.message);
        return true;
      },
    }
  );
}