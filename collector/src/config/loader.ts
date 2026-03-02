import fs from 'fs';
import path from 'path';
import { parse as parseYaml } from 'yaml';

export interface Source {
  id: string;
  name: string;
  root_url: string;
  type: 'rss' | 'html' | 'api';
  tier: number;
  tags: string[];
  refresh_interval_minutes: number;
  allow_paths?: string[];
  deny_paths?: string[];
  max_requests_per_minute?: number;
}

export interface CollectorPolicy {
  max_requests_per_minute: number;
  respect_robots: boolean;
  user_agent: string;
  timeout_ms: number;
  retry_count: number;
  backoff_ms: number;
}

export interface SourcesConfig {
  sources: Source[];
  policies: CollectorPolicy;
}

export function loadSources(configPath?: string): Source[] {
  const filePath = configPath ?? path.resolve(__dirname, '../../../config/sources.yaml');
  const raw = fs.readFileSync(filePath, 'utf8');
  const config = parseYaml(raw) as SourcesConfig;
  return config.sources;
}
