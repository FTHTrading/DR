// One-shot migration runner for Neon
import { readFileSync } from 'fs';
import pg from 'pg';
const { Client } = pg;

const connStr = process.env.DATABASE_URL || process.argv[2];
if (!connStr) { console.error('Usage: node migrate.mjs <DATABASE_URL>'); process.exit(1); }

const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('Connected to Neon');

const files = ['001_init.sql', '002_projects.sql'];
for (const f of files) {
  const sql = readFileSync(new URL(f, import.meta.url), 'utf8');
  console.log(`Running ${f} ...`);
  await client.query(sql);
  console.log(`  ✓ ${f} done`);
}

await client.end();
console.log('Migrations complete');
