import { db } from './db';
import { DocumentRecord } from './types';
import { logger } from '../lib/logger';

export class StorageService {
  async saveDocument(doc: DocumentRecord): Promise<void> {
    await db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        await client.query(
          `INSERT INTO documents
             (id, source_id, url, title, clean_text, raw_html, content_hash,
              status_code, fetched_at, tier, tags)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           ON CONFLICT (content_hash) DO NOTHING`,
          [
            doc.id,
            doc.sourceId,
            doc.url,
            doc.title,
            doc.cleanText,
            doc.rawHtml,
            doc.contentHash,
            doc.statusCode,
            doc.fetchedAt,
            doc.tier,
            doc.tags,
          ]
        );

        // Append-only audit log entry
        await client.query(
          `INSERT INTO audit_log (event_type, entity_type, entity_id, payload, created_at)
           VALUES ('document.stored', 'document', $1, $2, NOW())`,
          [doc.id, JSON.stringify({ sourceId: doc.sourceId, url: doc.url, hash: doc.contentHash })]
        );

        await client.query('COMMIT');
        logger.debug({ docId: doc.id }, 'Document committed to DB');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    });
  }
}
