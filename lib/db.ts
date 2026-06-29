// /lib/db.ts
// Database Connection Pool Manager
// This file initializes a secure connection to your enterprise database.
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/db/schema';

// We implement connection pooling to handle high-velocity CRM interactions securely.
// Ensure DATABASE_URL is set in the environment variables.
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

const sqlHost = process.env.SQL_HOST;
const sqlUser = process.env.SQL_USER;
const sqlPassword = process.env.SQL_PASSWORD;
const sqlDbName = process.env.SQL_DB_NAME;

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))) {
  dbUrl = undefined;
  delete process.env.DATABASE_URL;
}

if (sqlHost && sqlUser && sqlPassword && sqlDbName) {
  process.env.DATABASE_URL = "postgres://dummy";
  pool = new Pool({
    user: sqlUser,
    password: sqlPassword,
    database: sqlDbName,
    host: sqlHost, // Use the Unix socket path directly
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
} else if (dbUrl) {
  pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

if (pool) {
  db = drizzle(pool, { schema });

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle database client', err);
  });
} else {
  console.warn("DATABASE_URL is not set. Database operations will fail if called.");
}

export { db, schema };

/**
 * Execute a query securely using parameterized statements to prevent SQL injection.
 * @param text The SQL query string
 * @param params Array of parameter values matching the query placeholders $1, $2, etc.
 * @returns QueryResult
 */
export const query = async (text: string, params?: any[]) => {
  if (!pool) throw new Error("Database not connected. Provide DATABASE_URL.");
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
  if (!pool) throw new Error("Database not connected. Provide DATABASE_URL.");
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
