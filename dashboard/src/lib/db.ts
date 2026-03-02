import { neon } from '@neondatabase/serverless';

/**
 * Neon serverless Postgres driver — HTTP mode.
 *
 * Uses fetch-based queries (no WebSocket, no persistent pool).
 * This avoids the Cloudflare Workers "Cannot perform I/O on behalf
 * of a different request" error caused by singleton Pool objects
 * sharing connections across request contexts.
 */
function getSql() {
  const connectionString = process.env.DATABASE_URL ?? '';
  if (!connectionString) {
    console.warn('[db] DATABASE_URL is not set — database queries will fail');
  }
  return neon(connectionString);
}

export async function query<T extends object>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const exec = getSql();
  // neon() supports (query, params) at runtime; cast to satisfy TS overloads
  const rows = await (exec as Function)(sql, params ?? []);
  return rows as T[];
}
