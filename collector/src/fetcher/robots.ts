import axios from 'axios';
import robotsParser from 'robots-parser';
import { logger } from '../lib/logger';

const CACHE = new Map<string, { allowed: boolean; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class RobotsChecker {
  async isAllowed(url: string, userAgent: string): Promise<boolean> {
    if (process.env.RESPECT_ROBOTS_TXT === 'false') return true;

    try {
      const { origin } = new URL(url);
      const cacheKey = `${origin}::${userAgent}`;
      const cached = CACHE.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) return cached.allowed;

      const robotsUrl = `${origin}/robots.txt`;
      const resp = await axios.get<string>(robotsUrl, {
        timeout: 5000,
        responseType: 'text',
        validateStatus: () => true,
      });

      if (resp.status === 404) {
        CACHE.set(cacheKey, { allowed: true, expiresAt: Date.now() + CACHE_TTL_MS });
        return true;
      }

      const parser = robotsParser(robotsUrl, resp.data);
      const allowed = parser.isAllowed(url, userAgent) ?? true;
      CACHE.set(cacheKey, { allowed, expiresAt: Date.now() + CACHE_TTL_MS });
      return allowed;
    } catch (err) {
      logger.warn({ err, url }, 'robots.txt check failed, allowing by default');
      return true;
    }
  }
}
