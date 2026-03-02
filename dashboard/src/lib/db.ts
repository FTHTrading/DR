import { Pool, neon } from '@neondatabase/serverless';

let pool: Pool | null = null;

/**
 * Neon serverless Postgres driver.
 * Uses WebSocket connections — works in Cloudflare Workers, Node.js, and Edge.
 * Drop-in replacement for node-postgres `pg.Pool`.
 */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL ?? '';
    if (!connectionString) {
      console.warn('[db] DATABASE_URL is not set — database queries will fail');
    }

    pool = new Pool({
      connectionString,
      max: 2, // Serverless: keep pool minimal
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    });

    pool.on('error', (err: Error) => {
      console.error('[db] idle client error', err.message);
    });
  }
  return pool;
}

/**
 * One-shot query via Neon's HTTP SQL endpoint.
 * Fastest for single queries — no WebSocket handshake needed.
 */
export function sql() {
  const connectionString = process.env.DATABASE_URL ?? '';
  return neon(connectionString);
}

export async function query<T extends object>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}
