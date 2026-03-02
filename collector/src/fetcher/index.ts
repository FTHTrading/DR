import axios from 'axios';
import axiosRetry from 'axios-retry';
import { Source } from '../config/loader';
import { RobotsChecker } from './robots';
import { db } from '../storage/db';
import { logger } from '../lib/logger';

// Shared axios instance with exponential backoff retry
const httpClient = axios.create({
  timeout: parseInt(process.env.FETCH_TIMEOUT_MS ?? '15000'),
  headers: {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  },
});

axiosRetry(httpClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    axiosRetry.isNetworkOrIdempotentRequestError(err) ||
    (err.response?.status !== undefined && err.response.status >= 500),
  onRetry: (retryCount, err, config) => {
    logger.warn({ url: config.url, retryCount, status: err.response?.status }, 'Retrying fetch');
  },
});

export interface RawFetch {
  sourceId: string;
  url: string;
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  fetchedAt: Date;
}

const DOMAIN_LAST: Map<string, number> = new Map();

function rateLimitDelay(domain: string, maxPerMinute: number): Promise<void> {
  const last = DOMAIN_LAST.get(domain) ?? 0;
  const minGap = Math.ceil(60_000 / maxPerMinute);
  const now = Date.now();
  const wait = Math.max(0, last + minGap - now);
  DOMAIN_LAST.set(domain, now + wait);
  return new Promise((res) => setTimeout(res, wait));
}

async function fetchWithClient(
  url: string,
  headers: Record<string, string>
): Promise<{ status: number; headers: Record<string, string>; data: string } | null> {
  const resp = await httpClient.get<string>(url, {
    headers,
    responseType: 'text',
    validateStatus: () => true, // never throw on HTTP status; let retry condition decide
  });
  return { status: resp.status, headers: resp.headers as Record<string, string>, data: resp.data };
}

export class Fetcher {
  private robots: RobotsChecker;
  private userAgent: string;

  constructor() {
    this.robots = new RobotsChecker();
    this.userAgent = process.env.COLLECTOR_USER_AGENT ?? 'DICS-Collector/1.0 (+https://example.com/bot)';
    // Timeout is configured on the shared httpClient instance
  }

  async fetch(source: Source): Promise<RawFetch | null> {
    const allowed = await this.robots.isAllowed(source.root_url, this.userAgent);
    if (!allowed) {
      logger.warn({ url: source.root_url }, 'Blocked by robots.txt');
      // Record denial in audit log for compliance evidence
      await db.query(
        `INSERT INTO audit_log (event_type, entity_type, entity_id, payload, created_at)
         VALUES ('robots.denied','source',$1,$2,NOW())`,
        [source.id, JSON.stringify({ url: source.root_url })]
      ).catch(() => { /* non-fatal */ });
      return null;
    }

    const domain = new URL(source.root_url).hostname;
    await rateLimitDelay(domain, source.max_requests_per_minute ?? 10);

    const cachedMeta = await db.queryOne<{ etag: string | null; last_modified: string | null }>(
      'SELECT etag, last_modified FROM source_cache WHERE source_id = $1',
      [source.id]
    );

    const reqHeaders: Record<string, string> = {
      'User-Agent': this.userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    };
    if (cachedMeta?.etag) reqHeaders['If-None-Match'] = cachedMeta.etag;
    if (cachedMeta?.last_modified) reqHeaders['If-Modified-Since'] = cachedMeta.last_modified;

    try {
      const resp = await fetchWithClient(source.root_url, reqHeaders);
      if (!resp) return null;

      if (resp.status === 304) {
        logger.debug({ url: source.root_url }, 'Not modified (304)');
        return null;
      }

      const newEtag = resp.headers['etag'] ?? null;
      const newLastMod = resp.headers['last-modified'] ?? null;
      await db.query(
        `INSERT INTO source_cache (source_id, etag, last_modified, updated_at)
         VALUES ($1,$2,$3,NOW())
         ON CONFLICT (source_id) DO UPDATE
           SET etag=$2, last_modified=$3, updated_at=NOW()`,
        [source.id, newEtag, newLastMod]
      );

      return {
        sourceId: source.id,
        url: source.root_url,
        statusCode: resp.status,
        headers: resp.headers,
        body: resp.data,
        fetchedAt: new Date(),
      };
    } catch (err) {
      logger.error({ err, url: source.root_url }, 'Fetch error');
      return null;
    }
  }
}
