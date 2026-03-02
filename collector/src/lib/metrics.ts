/**
 * Lightweight Prometheus-compatible metrics endpoint.
 *
 * Exposes a GET /metrics route on METRICS_PORT (default 9091).
 * Designed to be scraped by Prometheus or read directly.
 *
 * Counters are in-process only — reset on restart.
 * For persistent metrics, wire into a Prometheus pushgateway or external store.
 */

import http from 'http';
import { logger } from './logger';

export interface Metrics {
  collector_fetch_total: number;
  collector_fetch_ok: number;
  collector_fetch_fail: number;
  collector_fetch_skipped: number;
  collector_robots_denied: number;
  collector_dedupe_skipped: number;
  collector_documents_saved: number;
  extractor_claims_generated: number;
  alerts_sent: number;
}

const counters: Metrics = {
  collector_fetch_total: 0,
  collector_fetch_ok: 0,
  collector_fetch_fail: 0,
  collector_fetch_skipped: 0,
  collector_robots_denied: 0,
  collector_dedupe_skipped: 0,
  collector_documents_saved: 0,
  extractor_claims_generated: 0,
  alerts_sent: 0,
};

export function inc(key: keyof Metrics, amount = 1): void {
  counters[key] += amount;
}

export function getMetrics(): Metrics {
  return { ...counters };
}

function renderPrometheusText(): string {
  return (Object.entries(counters) as [keyof Metrics, number][])
    .map(([k, v]) => `# TYPE ${k} counter\n${k} ${v}`)
    .join('\n') + '\n';
}

export function startMetricsServer(): http.Server {
  const port = parseInt(process.env.METRICS_PORT ?? '9091');

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/metrics') {
      res.writeHead(200, { 'Content-Type': 'text/plain; version=0.0.4' });
      res.end(renderPrometheusText());
    } else if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', ts: new Date().toISOString() }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    logger.info({ port }, 'Metrics server listening');
  });

  return server;
}
