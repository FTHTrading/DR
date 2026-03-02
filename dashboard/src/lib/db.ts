import { Pool } from 'pg';

let pool: Pool | null = null;

// Detect serverless / Netlify environment to apply SSL and lower pool ceiling
const isServerless =
  process.env.NETLIFY === 'true' ||
  process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL ?? '';

    // Use SSL when the connection string requests it or when running serverless
    const sslRequired =
      connectionString.includes('sslmode=require') ||
      connectionString.includes('sslmode=disable') === false && isServerless;

    pool = new Pool({
      connectionString,
      // Serverless: keep pool tiny — each function invocation gets its own cold start
      max:              isServerless ? 2 : 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
    });

    pool.on('error', (err) => {
      console.error('[db] idle client error', err.message);
    });
  }
  return pool;
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
