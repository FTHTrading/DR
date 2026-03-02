import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import crypto from 'crypto';
import { randomUUID } from 'crypto';
import { RawFetch } from '../fetcher';
import { Source } from '../config/loader';
import { DocumentRecord } from '../storage/types';

export class Normalizer {
  /**
   * Converts a raw HTTP fetch into a clean DocumentRecord ready for storage.
   */
  normalize(raw: RawFetch, source: Source): DocumentRecord {
    const { articleText, title } = this.extractReadable(raw.body, raw.url);

    const contentHash = crypto
      .createHash('sha256')
      .update(articleText)
      .digest('hex');

    return {
      id: randomUUID(),
      sourceId: raw.sourceId,
      url: raw.url,
      title: title ?? '',
      cleanText: articleText,
      rawHtml: raw.body,
      contentHash,
      statusCode: raw.statusCode,
      fetchedAt: raw.fetchedAt,
      tier: source.tier,
      tags: source.tags,
    };
  }

  private extractReadable(html: string, url: string): { articleText: string; title: string | null } {
    try {
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      return {
        articleText: article?.textContent?.trim() ?? html,
        title: article?.title ?? null,
      };
    } catch {
      return { articleText: html, title: null };
    }
  }
}
