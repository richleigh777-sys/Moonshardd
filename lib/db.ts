// /lib/db.ts
// Database Connection Pool Manager
// This file initializes a secure connection to your enterprise database.
import { Pool } from 'pg';

// We implement connection pooling to handle high-velocity CRM interactions securely.
// Ensure DATABASE_URL is set in the environment variables.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enhanced security: enforce SSL in production networks 
  // (adjust settings based on your infrastructure provider)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 20, // Max clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Execute a query securely using parameterized statements to prevent SQL injection.
 * @param text The SQL query string
 * @param params Array of parameter values matching the query placeholders $1, $2, etc.
 * @returns QueryResult
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // In a strict production environment, logs shouldn't leak PII. 
    // We only log query execution stats for telemetry.
    if (process.env.NODE_ENV !== 'production') {
       console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error; // Re-throw to be handled by the API layer router
  }
};

/**
 * Executes queries within a transactional block. Useful for complex operations (e.g. commission + sale entry).
 * @param callback A function containing the transactional queries
 */
export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
