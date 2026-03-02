const { Client } = require('pg');
const c = new Client('postgresql://neondb_owner:npg_NVCM96PpTsyi@ep-long-night-aiyga32u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');
c.connect()
  .then(() => c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='documents' ORDER BY ordinal_position`))
  .then(r => { console.table(r.rows); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
