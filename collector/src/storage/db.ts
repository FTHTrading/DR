import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { logger } from '../lib/logger';

class Database {
  private pool: Pool | null = null;

  async connect() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
    // Verify connection
    const client = await this.pool.connect();
    client.release();
    logger.info('PostgreSQL pool created');
  }

  async end() {
    await this.pool?.end();
  }

  async query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('Database not connected');
    return this.pool.query<T>(sql, params);
  }

  async queryOne<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return result.rows[0] ?? null;
  }

  async withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!this.pool) throw new Error('Database not connected');
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }
}

export const db = new Database();
