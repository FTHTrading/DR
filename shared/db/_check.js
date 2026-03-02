const pg = require('pg');
const c = new pg.Client({
  connectionString: 'postgresql://neondb_owner:npg_NVCM96PpTsyi@ep-long-night-aiyga32u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
});
c.connect().then(async () => {
  const r = await c.query(`
    SELECT
      (SELECT count(*) FROM claims) as claims,
      (SELECT count(*) FROM documents) as docs,
      (SELECT count(*) FROM entities) as entities,
      (SELECT count(*) FROM events) as events,
      (SELECT count(*) FROM relationships) as rels,
      (SELECT count(*) FROM audit_log) as audit,
      (SELECT count(*) FROM projects) as projects,
      (SELECT count(*) FROM project_metrics) as metrics,
      (SELECT count(*) FROM permits) as permits,
      (SELECT count(*) FROM source_cache) as sources
  `);
  console.log(JSON.stringify(r.rows[0], null, 2));
  await c.end();
}).catch(e => { console.error(e.message); process.exit(1); });
