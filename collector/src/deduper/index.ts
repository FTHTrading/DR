import { db } from '../storage/db';

export class Deduper {
  /**
   * Returns true if this content hash already exists in the documents table.
   */
  async check(contentHash: string): Promise<boolean> {
    const row = await db.queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM documents WHERE content_hash = $1) AS exists',
      [contentHash]
    );
    return row?.exists ?? false;
  }
}
