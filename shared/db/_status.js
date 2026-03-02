const { Client } = require('pg');
const c = new Client('postgresql://neondb_owner:npg_NVCM96PpTsyi@ep-long-night-aiyga32u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');
c.connect()
  .then(() => c.query(`
    SELECT 
      COUNT(*) FILTER (WHERE extracted_at IS NULL AND failed_at IS NULL) AS unprocessed,
      COUNT(*) FILTER (WHERE extracted_at IS NOT NULL) AS extracted,
      COUNT(*) FILTER (WHERE failed_at IS NOT NULL) AS failed,
      COUNT(*) AS total
    FROM documents
  `))
  .then(r => { console.log(r.rows[0]); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
