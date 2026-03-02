import 'dotenv/config';
import { logger } from './lib/logger';
import { startMetricsServer } from './lib/metrics';
import { Scheduler } from './scheduler';
import { db } from './storage/db';

async function main() {
  logger.info('DICS Collector starting…');

  await db.connect();
  logger.info('Database connected');

  const metricsServer = startMetricsServer();

  const scheduler = new Scheduler();
  await scheduler.start();

  logger.info('Scheduler running. Press Ctrl+C to stop.');

  process.on('SIGINT', async () => {
    logger.info('Shutting down…');
    await scheduler.stop();
    metricsServer.close();
    await db.end();
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error(err, 'Fatal error in collector');
  process.exit(1);
});
