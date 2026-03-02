/**
 * Backfill existing claims with sector_normalized, location_normalized, and capital_intensity.
 * Then recompute asset_impact table.
 *
 * Run: node shared/db/_backfill_impact.js
 * Requires: DATABASE_URL in env or .env
 */
// Load dotenv from collector's node_modules
const path = require('path');
const collectorRoot = path.resolve(__dirname, '../../collector');
process.chdir(collectorRoot);
require('dotenv').config({ path: path.resolve(collectorRoot, '.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Sector keywords (mirrors extractor/src/scoring/normalizer.py) ──
const SECTOR_KW = {
  energy: ['solar','photovoltaic','bess','battery','grid','generation','concession','wind',
           'renewable','electricity','substation','interconnection','eted','cne','sie',
           'egehaina','aes','lng','natural gas','power plant','capacity','mw','mwh',
           'frequency regulation','peak shifting','curtailment','dispatch'],
  mining: ['rare earth','ree','mining','mineral','geological','dgm','deposit','treo',
           'ore','cerium','lanthanum','neodymium','drill','survey','geophysical','usgs','cordillera'],
  telecom: ['5g','fiber','cable','submarine','data center','spectrum','indotel','altice',
            'claro','mvno','broadband','connectivity','digital','telecom','bandwidth','latency'],
  logistics: ['port','caucedo','airport','free zone','logistics','cargo','container','teu',
              'warehouse','berth','ship','maritime','road','highway','mopc','apordom','dp world'],
  finance: ['fdi','investment','bond','credit','loan','gdp','inflation','central bank',
            'bancentral','peso','usd','financing','debt','equity','dfi','idb','world bank','ifc','miga'],
  tourism: ['tourism','hotel','resort','ecotourism','confotur','visitor','hospitality',
            'villa','beach','destination','travel','masterplan','mixed-use','real estate'],
  macro: ['government','president','congress','law','decree','reform','regulation','policy','sovereign','esg'],
};

const LOCATION_KW = {
  bani: ['baní','bani','peravia'],
  cabrera: ['cabrera','maría trinidad','maria trinidad'],
  pedernales: ['pedernales'],
  santo_domingo: ['santo domingo','distrito nacional','capital','ozama'],
  samana: ['samaná','samana','las terrenas'],
  national: ['dominican republic','república dominicana','nationwide','country-wide','national'],
};

const CAP_PATTERNS = [
  [/\bppa\b|power purchase agreement/i, 1.3],
  [/\bgrid\s+(?:interconnection|approval|upgrade)/i, 1.2],
  [/\bconcession\b/i, 1.2],
  [/\bconstruction\s+(?:began|started|completed)/i, 1.15],
  [/\bfinancing\s+(?:signed|closed|approved)/i, 1.25],
  [/\brfp\b|\btender\b/i, 1.1],
  [/\b(?:fdi|foreign direct investment)\b/i, 1.1],
  [/\bgreen bond\b|\bsll\b|\bsustainability/i, 1.15],
  [/\b(?:article|reported|according to|sources say)\b/i, 0.5],
  [/\b(?:press release|announcement|newsletter)\b/i, 0.6],
];

function classifySector(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [sector, kws] of Object.entries(SECTOR_KW)) {
    scores[sector] = 0;
    for (const kw of kws) {
      if (lower.includes(kw)) scores[sector]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'macro';
}

function classifyLocation(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [loc, kws] of Object.entries(LOCATION_KW)) {
    scores[loc] = 0;
    for (const kw of kws) {
      if (lower.includes(kw)) scores[loc]++;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'national';
}

function capitalIntensity(text) {
  const lower = text.toLowerCase();
  let mod = 0.8;
  for (const [re, weight] of CAP_PATTERNS) {
    if (re.test(lower)) mod = Math.max(mod, weight);
  }
  return Math.round(Math.min(1.5, mod) * 100) / 100;
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, statement, excerpt FROM claims WHERE sector_normalized IS NULL`
    );
    console.log(`Backfilling ${rows.length} claims...`);

    for (const row of rows) {
      const text = `${row.statement || ''} ${row.excerpt || ''}`;
      const sector = classifySector(text);
      const location = classifyLocation(text);
      const capInt = capitalIntensity(text);

      await client.query(
        `UPDATE claims
         SET sector_normalized = $1,
             location_normalized = $2,
             capital_intensity = $3
         WHERE id = $4`,
        [sector, location, capInt, row.id]
      );
    }

    // Now compute asset impact
    const impactResult = await client.query('SELECT compute_asset_impact()');
    console.log('Asset impact computed:', impactResult.rows[0]);

    // Check results
    const summary = await client.query('SELECT * FROM asset_impact_summary');
    console.log('\nAsset Impact Summary:');
    console.log(JSON.stringify(summary.rows, null, 2));

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
