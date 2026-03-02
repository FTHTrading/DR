import { CronJob } from 'cron';
import PQueue from 'p-queue';
import { loadSources, Source } from '../config/loader';
import { Fetcher } from '../fetcher';
import { Normalizer } from '../normalizer';
import { Deduper } from '../deduper';
import { StorageService } from '../storage';
import { logger } from '../lib/logger';
import { inc } from '../lib/metrics';

/**
 * Convert a refresh interval in minutes to a valid 6-field cron expression.
 * cron fields: second minute hour dayOfMonth month dayOfWeek
 */
function minutesToCron(minutes: number): string {
  if (minutes <= 0) return '0 */60 * * * *';
  if (minutes < 60) return `0 */${minutes} * * * *`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `0 0 */${hours} * * *`;
  const days = Math.floor(hours / 24);
  return `0 0 0 */${days} * *`;
}

export class Scheduler {
  private jobs: CronJob[] = [];
  private queue: PQueue;
  private fetcher: Fetcher;
  private normalizer: Normalizer;
  private deduper: Deduper;
  private storage: StorageService;

  constructor() {
    this.queue = new PQueue({ concurrency: 5 });
    this.fetcher = new Fetcher();
    this.normalizer = new Normalizer();
    this.deduper = new Deduper();
    this.storage = new StorageService();
  }

  async start() {
    const sources = await loadSources();
    logger.info(`Loaded ${sources.length} sources`);

    for (const source of sources) {
      const intervalMinutes = source.refresh_interval_minutes ?? 60;
      const cronExpression = minutesToCron(intervalMinutes);

      const job = new CronJob(
        cronExpression,
        () => {
          void this.queue.add(() => this.processSource(source));
        },
        null,
        true,
        'UTC'
      );

      this.jobs.push(job);
      logger.info({ sourceId: source.id, cron: cronExpression }, 'Scheduled source');

      // Run immediately on startup
      void this.queue.add(() => this.processSource(source));
    }
  }

  async stop() {
    for (const job of this.jobs) {
      job.stop();
    }
    await this.queue.onIdle();
    logger.info('All jobs stopped');
  }

  private async processSource(source: Source) {
    logger.info({ sourceId: source.id }, 'Processing source');
    inc('collector_fetch_total');
    try {
      const raw = await this.fetcher.fetch(source);
      if (!raw) {
        inc('collector_fetch_skipped'); // 304, robots denial, or transient error
        return;
      }
      inc('collector_fetch_ok');

      const doc = await this.normalizer.normalize(raw, source);
      const isDuplicate = await this.deduper.check(doc.contentHash);
      if (isDuplicate) {
        logger.debug({ sourceId: source.id, hash: doc.contentHash }, 'Duplicate, skipping');
        inc('collector_dedupe_skipped');
        return;
      }

      await this.storage.saveDocument(doc);
      inc('collector_documents_saved');
      logger.info({ sourceId: source.id, docId: doc.id }, 'Document saved');
    } catch (err) {
      inc('collector_fetch_fail');
      logger.error({ err, sourceId: source.id }, 'Error processing source');
    }
  }
}
