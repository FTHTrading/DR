-- DICS Migration 003: Seed Intelligence Data
-- Populates documents, entities, claims, events, relationships, audit_log, source_cache
-- so the console dashboard displays live intelligence data.

-- ──────────────────────────────────────────────
-- Source Cache (simulates collector state)
-- ──────────────────────────────────────────────
INSERT INTO source_cache (source_id, etag, last_modified, updated_at) VALUES
  ('sie-gob-do',        '"abc123"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('cne-gob-do',        '"def456"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('dgm-gob-do',        '"ghi789"', 'Sat, 01 Mar 2026 00:00:00 GMT', NOW() - interval '1 day'),
  ('usgs-gov',          '"jkl012"', 'Fri, 28 Feb 2026 00:00:00 GMT', NOW() - interval '2 days'),
  ('bancentral-gov-do', '"mno345"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('worldbank-org',     '"pqr678"', 'Sat, 01 Mar 2026 00:00:00 GMT', NOW() - interval '1 day'),
  ('idb-org',           '"stu901"', 'Sat, 01 Mar 2026 00:00:00 GMT', NOW() - interval '1 day'),
  ('prodominicana-gob', '"vwx234"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('dpworld-com',       '"yza567"', 'Thu, 27 Feb 2026 00:00:00 GMT', NOW() - interval '3 days'),
  ('egehaina-com',      '"bcd890"', 'Sat, 01 Mar 2026 00:00:00 GMT', NOW() - interval '1 day'),
  ('altice-com-do',     '"efg123"', 'Fri, 28 Feb 2026 00:00:00 GMT', NOW() - interval '2 days'),
  ('diariolibre-com',   '"hij456"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('listin-com-do',     '"klm789"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('eldinero-com-do',   '"nop012"', 'Sat, 01 Mar 2026 00:00:00 GMT', NOW() - interval '1 day'),
  ('hoy-com-do',        '"qrs345"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('aird-org-do',       '"tuv678"', 'Fri, 28 Feb 2026 00:00:00 GMT', NOW() - interval '2 days'),
  ('reddit-domrep',     '"wxy901"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours'),
  ('x-dr-energy',       '"zab234"', 'Sun, 02 Mar 2026 00:00:00 GMT', NOW() - interval '8 hours')
ON CONFLICT (source_id) DO NOTHING;

-- ──────────────────────────────────────────────
-- Documents (realistic DR intelligence reports)
-- ──────────────────────────────────────────────
INSERT INTO documents (id, source_id, url, title, clean_text, content_hash, status_code, tier, tags, fetched_at, extracted_at) VALUES

-- T1 Government docs
('d0000001-0001-4000-8000-000000000001', 'cne-gob-do',
 'https://cne.gob.do/resoluciones/res-2026-018',
 'CNE Resolution 2026-018: Solar Generation Concession — Baní Zone',
 'The National Energy Commission (CNE) hereby grants generation concession CNE-SOL-2026-018 for the development of a 50 MW photovoltaic solar facility with 25 MW / 100 MWh battery energy storage in Baní, Peravia Province. The concessionee shall comply with all interconnection requirements set forth by ETED and environmental conditions imposed by the Ministry of Environment. This concession is valid for 30 years from the date of publication. The estimated capital expenditure is $55 million USD with a projected PPA target of $70/MWh under a 25-year term with 1.5% annual escalation.',
 'sha256_cne_res2026018_v1', 200, 1, ARRAY['energy','solar','concession','bani'], NOW() - interval '6 hours', NOW() - interval '5 hours'),

('d0000001-0001-4000-8000-000000000002', 'sie-gob-do',
 'https://sie.gob.do/data/generation-q1-2026',
 'SIE Q1 2026 Generation Report — Dominican Republic',
 'The Superintendencia de Electricidad reports that renewable energy generation reached 24.3% of total dispatched energy in Q1 2026, up from 21.8% in Q1 2025. Solar capacity additions totaled 127 MW, with the Baní corridor emerging as the highest-density solar zone. Grid reliability improved to 99.2% availability in the interconnected system. Total generation capacity stands at 5,847 MW across all fuel types. Variable renewable energy curtailment decreased by 15% quarter-over-quarter, attributed to BESS deployment at three major substations.',
 'sha256_sie_q1_2026_gen', 200, 1, ARRAY['energy','solar','grid','statistics'], NOW() - interval '7 hours', NOW() - interval '6 hours'),

('d0000001-0001-4000-8000-000000000003', 'dgm-gob-do',
 'https://dgm.gob.do/mining/samana-ree-survey-2026',
 'DGM Geological Survey: Samaná Peninsula Rare Earth Elements',
 'The Dirección General de Minería (DGM) has completed preliminary geophysical surveys in the Samaná Peninsula, confirming anomalous concentrations of light rare earth elements (LREEs) including cerium, lanthanum, and neodymium. Estimated in-situ resource potential ranges from 12,000 to 18,000 tonnes of total rare earth oxides (TREO). The DGM recommends Phase II drilling at three priority sites identified by airborne magnetic surveys. Environmental baseline studies have been initiated in coordination with the Ministry of Environment.',
 'sha256_dgm_samana_ree_2026', 200, 1, ARRAY['mining','rare_earth','samana'], NOW() - interval '1 day', NOW() - interval '23 hours'),

('d0000001-0001-4000-8000-000000000004', 'usgs-gov',
 'https://pubs.usgs.gov/of/2026/caribbean-ree-assessment',
 'USGS Open File Report: Caribbean Basin Rare Earth Potential',
 'The United States Geological Survey has released a comprehensive assessment of rare earth element potential across the Caribbean Basin. The Dominican Republic''s Samaná Peninsula and Cordillera Central regions show moderate-to-high potential for light rare earth deposits based on regional geochemistry. The assessment builds on DGM/USGS cooperation initiated in 2024. Global supply chain disruptions from China''s export controls continue to make Caribbean rare earth sources strategically significant for North American supply chain diversification.',
 'sha256_usgs_caribbean_ree', 200, 1, ARRAY['mining','rare_earth','usgs','strategic'], NOW() - interval '2 days', NOW() - interval '47 hours'),

('d0000001-0001-4000-8000-000000000005', 'bancentral-gov-do',
 'https://bancentral.gob.do/estadisticas/ipc-2026-02',
 'Banco Central: February 2026 Economic Indicators',
 'The Central Bank of the Dominican Republic reports GDP growth of 5.1% year-over-year for Q4 2025, with construction and free zone sectors leading expansion. Foreign direct investment inflows totaled $4.2 billion USD in 2025, a 12% increase over 2024. The energy sector attracted $680 million in new investment commitments. The peso remained stable at DOP 59.8/USD. Inflation at 3.2% is within the target band. The Central Bank projects 4.8% GDP growth for 2026, supported by tourism recovery and infrastructure investment.',
 'sha256_bancentral_ipc_feb2026', 200, 1, ARRAY['finance','macro','gdp','fdi'], NOW() - interval '7 hours', NOW() - interval '6 hours'),

-- T2 Multilateral & Industry docs
('d0000001-0001-4000-8000-000000000006', 'worldbank-org',
 'https://worldbank.org/projects/dr-climate-smart-credit',
 'World Bank: DR Climate-Smart Agriculture Credit Line — $150M Approved',
 'The World Bank Board of Directors has approved a $150 million credit line for the Dominican Republic''s Climate-Smart Agriculture and Resilience Program. The program will finance adaptation investments including solar-powered irrigation systems, climate-resilient infrastructure in rural areas, and digital agricultural monitoring platforms. The credit includes a $30 million concessional window for community-scale renewable energy projects under 5 MW capacity. Disbursement begins Q2 2026.',
 'sha256_wb_climate_credit', 200, 2, ARRAY['finance','agriculture','climate','worldbank'], NOW() - interval '1 day', NOW() - interval '23 hours'),

('d0000001-0001-4000-8000-000000000007', 'idb-org',
 'https://idb.org/projects/dr-digital-infrastructure',
 'IDB Invest: DR Digital Infrastructure Corridor — $85M Framework',
 'IDB Invest announces an $85 million financing framework for the Dominican Republic''s Digital Infrastructure Corridor, targeting submarine cable landing stations, inland fiber backbone expansion, and edge data center construction. The framework supports the DR''s National Digital Agenda 2030 and includes technical assistance for cybersecurity capacity building. Priority corridors connect Santo Domingo–Santiago–Puerto Plata and Santo Domingo–Punta Cana–La Romana.',
 'sha256_idb_digital_corridor', 200, 2, ARRAY['telecom','infrastructure','idb','connectivity'], NOW() - interval '1 day', NOW() - interval '22 hours'),

('d0000001-0001-4000-8000-000000000008', 'prodominicana-gob',
 'https://prodominicana.gob.do/inversiones/free-zone-q1-2026',
 'ProDominicana: Free Zone Investment Report Q1 2026',
 'ProDominicana reports 14 new free zone companies registered in Q1 2026, generating an estimated 3,200 direct jobs. The Santiago Logistics Hub attracted $42 million in new warehousing and distribution commitments. Medical device manufacturing continues to expand with two new facilities in the PIISA free zone. Total free zone export value reached $2.1 billion in the trailing 12 months.',
 'sha256_prodom_fz_q1_2026', 200, 2, ARRAY['logistics','free_zone','investment','jobs'], NOW() - interval '8 hours', NOW() - interval '7 hours'),

('d0000001-0001-4000-8000-000000000009', 'dpworld-com',
 'https://dpworld.com/caucedo/expansion-2026-update',
 'DP World Caucedo: Port Expansion Phase III — $200M Commitment',
 'DP World has committed $200 million to Phase III expansion of the Caucedo multimodal port and logistics hub. The expansion will add 450 meters of new berth capacity, increase container throughput to 2.5 million TEU annually, and construct a 35,000 m² bonded logistics center. Phase III includes a dedicated LNG bunkering facility and shore-to-ship power systems to reduce vessel emissions. Construction began in January 2026 with projected completion by Q4 2027.',
 'sha256_dpworld_caucedo_ph3', 200, 2, ARRAY['logistics','port','infrastructure','investment'], NOW() - interval '3 days', NOW() - interval '71 hours'),

('d0000001-0001-4000-8000-000000000010', 'egehaina-com',
 'https://egehaina.com/noticias/bess-san-pedro-commissioning',
 'EGE Haina: 50 MWh BESS Commissioning at San Pedro de Macorís',
 'EGE Haina announces successful commissioning of its 25 MW / 50 MWh battery energy storage system at the Quisqueya II complex in San Pedro de Macorís. The system provides frequency regulation, peak shifting, and spinning reserve services to the SENI grid. This is the second utility-scale BESS deployment in the DR, following a 10 MW system by AES Dominicana. The combined BESS fleet provides 35 MW of fast-response capacity, enhancing variable renewable energy integration.',
 'sha256_egehaina_bess_spm', 200, 2, ARRAY['energy','bess','grid','egehaina'], NOW() - interval '1 day', NOW() - interval '23 hours'),

-- T2 Telecom
('d0000001-0001-4000-8000-000000000011', 'altice-com-do',
 'https://altice.com.do/5g-trial-santiago',
 'Altice Dominicana: 5G Trial Network Activated in Santiago',
 'Altice Dominicana has activated a limited 5G trial network covering the Pontezuela–Monument corridor in Santiago de los Caballeros. The deployment uses 3.5 GHz n78 band spectrum allocated by INDOTEL under provisional trial authorization. Initial measurements show downlink speeds exceeding 800 Mbps with sub-10ms latency. Altice plans to extend 5G coverage to industrial zones in Navarrete and the Cibao International Airport area in Q3 2026. Full commercial launch depends on final spectrum auction outcomes expected in late 2026.',
 'sha256_altice_5g_trial', 200, 2, ARRAY['telecom','5g','santiago','spectrum'], NOW() - interval '2 days', NOW() - interval '47 hours'),

-- T3 Industry/Press docs
('d0000001-0001-4000-8000-000000000012', 'diariolibre-com',
 'https://diariolibre.com/economia/energia/proyecto-solar-bani-avanza-permisos',
 'Diario Libre: Proyecto Solar Baní Avanza con Todos los Permisos',
 'El proyecto fotovoltaico de 50 MW en Baní, provincia Peravia, ha obtenido todas las autorizaciones necesarias de la CNE, ETED y el Ministerio de Medio Ambiente. Los desarrolladores estiman una inversión de US$55 millones y la creación de 300 empleos durante la fase de construcción. La planta incluirá un sistema de almacenamiento de baterías de 25 MW / 100 MWh, convirtiéndola en la primera instalación solar con BESS integrado a escala comercial del país. Se espera que la operación comercial inicie en Q3 2027.',
 'sha256_dl_bani_solar_permisos', 200, 3, ARRAY['energy','solar','bani','permits'], NOW() - interval '8 hours', NOW() - interval '7 hours'),

('d0000001-0001-4000-8000-000000000013', 'listin-com-do',
 'https://listin.com.do/economia/minerales-estrategicos-samana',
 'Listín Diario: Minerales Estratégicos en Samaná — DGM Confirma',
 'La Dirección General de Minería confirmó la presencia de tierras raras en la península de Samaná, con concentraciones significativas de cerio y neodimio. Expertos internacionales del USGS participaron en las prospecciones geofísicas. El hallazgo posiciona a República Dominicana como potencial proveedor de materiales críticos para la cadena de suministro norteamericana. La DGM advierte que cualquier explotación requerirá estudios de impacto ambiental rigurosos y consulta comunitaria.',
 'sha256_listin_ree_samana', 200, 3, ARRAY['mining','rare_earth','samana','strategic'], NOW() - interval '7 hours', NOW() - interval '6 hours'),

('d0000001-0001-4000-8000-000000000014', 'eldinero-com-do',
 'https://eldinero.com.do/tecnologia/fibra-optica-corridors-dr',
 'El Dinero: Three New Fiber Optic Corridors Planned for DR',
 'The Dominican Republic''s telecommunications regulator INDOTEL has approved permits for three new fiber optic backbone corridors connecting underserved regions. The corridors will link Santo Domingo to Samaná via Hato Mayor, extend the northern coastal backbone from Puerto Plata to Monte Cristi, and create a redundant southern loop through Azua and Barahona. Combined investment exceeds $120 million across three licensed operators. The project supports the country''s National Digital Agenda 2030 target of 95% household broadband coverage.',
 'sha256_eldinero_fiber_corridors', 200, 3, ARRAY['telecom','fiber','infrastructure','connectivity'], NOW() - interval '1 day', NOW() - interval '23 hours'),

('d0000001-0001-4000-8000-000000000015', 'hoy-com-do',
 'https://hoy.com.do/economia/zona-franca-santiago-expansion',
 'Hoy: Santiago Free Zone Expansion Attracts $42M in New Investment',
 'The Santiago Logistics Hub within the country''s largest free zone has attracted $42 million in new investment commitments during Q1 2026. New tenants include a medical device assembly plant, an automotive parts distributor, and a cold-chain logistics provider. The expansion creates an estimated 1,500 permanent jobs. The free zone authority is also developing a new 15-hectare parcel with pre-built industrial shells to accelerate tenant onboarding.',
 'sha256_hoy_fz_santiago', 200, 3, ARRAY['logistics','free_zone','santiago','investment'], NOW() - interval '7 hours', NOW() - interval '6 hours'),

('d0000001-0001-4000-8000-000000000016', 'aird-org-do',
 'https://aird.org.do/publicaciones/carbon-market-pilot-dr',
 'AIRD: Dominican Republic Carbon Market Pilot Framework',
 'The Association of Industries of the Dominican Republic (AIRD) has published a framework for a voluntary carbon market pilot. The pilot targets emission reduction certificates from industrial, energy, and transport sectors. Eligible projects include distributed solar installations above 1 MW, industrial energy efficiency retrofits, and electric vehicle fleet conversions. The framework aligns with Article 6 of the Paris Agreement and the DR''s updated NDC. Estimated tradeable volume: 500,000 tCO2e annually by 2028.',
 'sha256_aird_carbon_pilot', 200, 3, ARRAY['energy','carbon','climate','finance'], NOW() - interval '2 days', NOW() - interval '47 hours'),

-- T4 Community/Social
('d0000001-0001-4000-8000-000000000017', 'reddit-domrep',
 'https://reddit.com/r/dominican/comments/solar_bani_thread',
 'Reddit r/Dominican: Discussion — Solar Farm Project in Baní',
 'Community discussion thread about the proposed 50 MW solar farm in Baní. Users report seeing survey crews on the site near Sabana Buey. Local government representatives confirm land acquisition is complete. Concerns raised about agricultural land conversion, though supporters note the site is classified as marginal grazing land. Discussion includes comparisons with Monte Plata solar installations. Several users mention employment opportunities during construction phase.',
 'sha256_reddit_bani_solar', 200, 4, ARRAY['energy','solar','bani','community'], NOW() - interval '8 hours', NOW() - interval '7 hours'),

('d0000001-0001-4000-8000-000000000018', 'x-dr-energy',
 'https://x.com/DREnergy/status/samana-ree-discussion',
 'X Thread: Samaná Rare Earth Discovery Discussion',
 'Energy analysts on X discuss the implications of the DGM rare earth findings in Samaná. Key points: 1) Dominican RE deposits could reduce US dependency on China for critical minerals. 2) Environmental concerns in a tourism-dependent region require careful management. 3) Processing infrastructure would need to be built or ore exported to existing facilities. 4) Potential revenue estimated at $50-100M annually if deposits prove commercial. 5) Timeline: minimum 5-7 years to production even under fast-track permitting.',
 'sha256_x_samana_ree_thread', 200, 4, ARRAY['mining','rare_earth','samana','analysis'], NOW() - interval '7 hours', NOW() - interval '6 hours')

ON CONFLICT (content_hash) DO NOTHING;

-- ──────────────────────────────────────────────
-- Entities extracted from documents
-- ──────────────────────────────────────────────
INSERT INTO entities (id, doc_id, type, text, normalized, start_char, end_char, confidence) VALUES
-- From CNE concession doc
('e0000001-0001-4000-8000-000000000001', 'd0000001-0001-4000-8000-000000000001', 'ORG', 'CNE', 'cne', 0, 3, 1.0),
('e0000001-0001-4000-8000-000000000002', 'd0000001-0001-4000-8000-000000000001', 'GPE', 'Baní', 'bani', 200, 204, 1.0),
('e0000001-0001-4000-8000-000000000003', 'd0000001-0001-4000-8000-000000000001', 'ORG', 'ETED', 'eted', 300, 304, 1.0),
('e0000001-0001-4000-8000-000000000004', 'd0000001-0001-4000-8000-000000000001', 'MONEY', '$55 million USD', '$55 million usd', 400, 415, 0.95),
-- From SIE generation report
('e0000001-0001-4000-8000-000000000005', 'd0000001-0001-4000-8000-000000000002', 'ORG', 'Superintendencia de Electricidad', 'superintendencia de electricidad', 0, 32, 1.0),
('e0000001-0001-4000-8000-000000000006', 'd0000001-0001-4000-8000-000000000002', 'QUANTITY', '127 MW', '127 mw', 200, 206, 0.95),
-- From DGM survey
('e0000001-0001-4000-8000-000000000007', 'd0000001-0001-4000-8000-000000000003', 'ORG', 'DGM', 'dgm', 0, 3, 1.0),
('e0000001-0001-4000-8000-000000000008', 'd0000001-0001-4000-8000-000000000003', 'GPE', 'Samaná Peninsula', 'samana peninsula', 80, 97, 1.0),
('e0000001-0001-4000-8000-000000000009', 'd0000001-0001-4000-8000-000000000003', 'QUANTITY', '18,000 tonnes TREO', '18000 tonnes treo', 200, 220, 0.85),
-- From USGS report
('e0000001-0001-4000-8000-000000000010', 'd0000001-0001-4000-8000-000000000004', 'ORG', 'USGS', 'usgs', 0, 4, 1.0),
('e0000001-0001-4000-8000-000000000011', 'd0000001-0001-4000-8000-000000000004', 'GPE', 'Cordillera Central', 'cordillera central', 150, 169, 1.0),
-- From Banco Central
('e0000001-0001-4000-8000-000000000012', 'd0000001-0001-4000-8000-000000000005', 'ORG', 'Banco Central de la República Dominicana', 'banco central', 0, 40, 1.0),
('e0000001-0001-4000-8000-000000000013', 'd0000001-0001-4000-8000-000000000005', 'MONEY', '$4.2 billion USD', '$4.2 billion usd', 200, 218, 0.95),
-- From World Bank
('e0000001-0001-4000-8000-000000000014', 'd0000001-0001-4000-8000-000000000006', 'ORG', 'World Bank', 'world bank', 0, 10, 1.0),
('e0000001-0001-4000-8000-000000000015', 'd0000001-0001-4000-8000-000000000006', 'MONEY', '$150 million', '$150 million', 60, 72, 0.95),
-- From IDB
('e0000001-0001-4000-8000-000000000016', 'd0000001-0001-4000-8000-000000000007', 'ORG', 'IDB Invest', 'idb invest', 0, 10, 1.0),
('e0000001-0001-4000-8000-000000000017', 'd0000001-0001-4000-8000-000000000007', 'MONEY', '$85 million', '$85 million', 40, 52, 0.95),
-- From DP World
('e0000001-0001-4000-8000-000000000018', 'd0000001-0001-4000-8000-000000000009', 'ORG', 'DP World', 'dp world', 0, 8, 1.0),
('e0000001-0001-4000-8000-000000000019', 'd0000001-0001-4000-8000-000000000009', 'GPE', 'Caucedo', 'caucedo', 30, 37, 1.0),
('e0000001-0001-4000-8000-000000000020', 'd0000001-0001-4000-8000-000000000009', 'MONEY', '$200 million', '$200 million', 50, 62, 0.95),
-- From EGE Haina
('e0000001-0001-4000-8000-000000000021', 'd0000001-0001-4000-8000-000000000010', 'ORG', 'EGE Haina', 'ege haina', 0, 9, 1.0),
('e0000001-0001-4000-8000-000000000022', 'd0000001-0001-4000-8000-000000000010', 'GPE', 'San Pedro de Macorís', 'san pedro de macoris', 60, 81, 1.0),
-- From Altice
('e0000001-0001-4000-8000-000000000023', 'd0000001-0001-4000-8000-000000000011', 'ORG', 'Altice Dominicana', 'altice dominicana', 0, 17, 1.0),
('e0000001-0001-4000-8000-000000000024', 'd0000001-0001-4000-8000-000000000011', 'GPE', 'Santiago de los Caballeros', 'santiago', 80, 106, 1.0),
-- From fiber article
('e0000001-0001-4000-8000-000000000025', 'd0000001-0001-4000-8000-000000000014', 'ORG', 'INDOTEL', 'indotel', 50, 57, 1.0),
('e0000001-0001-4000-8000-000000000026', 'd0000001-0001-4000-8000-000000000014', 'MONEY', '$120 million', '$120 million', 300, 312, 0.9),
-- ProDominicana
('e0000001-0001-4000-8000-000000000027', 'd0000001-0001-4000-8000-000000000008', 'ORG', 'ProDominicana', 'prodominicana', 0, 13, 1.0),
('e0000001-0001-4000-8000-000000000028', 'd0000001-0001-4000-8000-000000000008', 'MONEY', '$42 million', '$42 million', 150, 161, 0.9)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────
-- Events detected in documents
-- ──────────────────────────────────────────────
INSERT INTO events (id, doc_id, type, description, entity_ids, raw_text, confidence) VALUES
('e1000001-0001-4000-8000-000000000001', 'd0000001-0001-4000-8000-000000000001', 'ConcessionAward',
 'CNE grants 50 MW solar generation concession for Baní zone',
 ARRAY['e0000001-0001-4000-8000-000000000001','e0000001-0001-4000-8000-000000000002']::uuid[],
 'CNE hereby grants generation concession CNE-SOL-2026-018', 0.95),
('e1000001-0001-4000-8000-000000000002', 'd0000001-0001-4000-8000-000000000003', 'DiscoveryClaim',
 'DGM confirms rare earth element concentrations in Samaná',
 ARRAY['e0000001-0001-4000-8000-000000000007','e0000001-0001-4000-8000-000000000008']::uuid[],
 'confirming anomalous concentrations of light rare earth elements', 0.90),
('e1000001-0001-4000-8000-000000000003', 'd0000001-0001-4000-8000-000000000006', 'Financing',
 'World Bank approves $150M climate-smart agriculture credit line for DR',
 ARRAY['e0000001-0001-4000-8000-000000000014']::uuid[],
 'approved a $150 million credit line', 0.95),
('e1000001-0001-4000-8000-000000000004', 'd0000001-0001-4000-8000-000000000009', 'CapexAnnouncement',
 'DP World commits $200M to Caucedo port Phase III expansion',
 ARRAY['e0000001-0001-4000-8000-000000000018','e0000001-0001-4000-8000-000000000019']::uuid[],
 'committed $200 million to Phase III expansion', 0.95),
('e1000001-0001-4000-8000-000000000005', 'd0000001-0001-4000-8000-000000000010', 'OperationalLaunch',
 'EGE Haina commissions 50 MWh BESS at San Pedro de Macorís',
 ARRAY['e0000001-0001-4000-8000-000000000021','e0000001-0001-4000-8000-000000000022']::uuid[],
 'successful commissioning of its 25 MW / 50 MWh battery energy storage', 0.90),
('e1000001-0001-4000-8000-000000000006', 'd0000001-0001-4000-8000-000000000011', 'OperationalLaunch',
 'Altice activates 5G trial network in Santiago',
 ARRAY['e0000001-0001-4000-8000-000000000023','e0000001-0001-4000-8000-000000000024']::uuid[],
 'activated a limited 5G trial network', 0.85),
('e1000001-0001-4000-8000-000000000007', 'd0000001-0001-4000-8000-000000000007', 'Financing',
 'IDB Invest announces $85M digital infrastructure financing framework',
 ARRAY['e0000001-0001-4000-8000-000000000016']::uuid[],
 '$85 million financing framework', 0.90),
('e1000001-0001-4000-8000-000000000008', 'd0000001-0001-4000-8000-000000000005', 'Partnership',
 'Dominican FDI reaches $4.2B in 2025 per Banco Central',
 ARRAY['e0000001-0001-4000-8000-000000000012']::uuid[],
 'Foreign direct investment inflows totaled $4.2 billion', 0.95)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────
-- Scored Claims (the core intelligence signals)
-- ──────────────────────────────────────────────
INSERT INTO claims (id, doc_id, statement, quantity, unit, who, what, where_text, when_text, excerpt, credibility, materiality, recency, opportunity, risk, composite_score, usd_amount) VALUES

-- High-value energy claims
('c0000001-0001-4000-8000-000000000001', 'd0000001-0001-4000-8000-000000000001',
 'CNE grants 50 MW solar generation concession with 25 MW BESS for Baní, Peravia Province. Estimated CAPEX $55M, PPA target $70/MWh with 25-year term.',
 50, 'MW', 'CNE', 'Solar concession with BESS', 'Baní, Peravia', '2026',
 'grants generation concession CNE-SOL-2026-018 for the development of a 50 MW photovoltaic solar facility with 25 MW / 100 MWh battery energy storage',
 1.0, 0.95, 1.0, 0.90, 0.15, 0.88, 55000000),

('c0000001-0001-4000-8000-000000000002', 'd0000001-0001-4000-8000-000000000002',
 'Renewable energy reaches 24.3% of total dispatched energy in Q1 2026. Solar additions total 127 MW. Grid reliability at 99.2%.',
 127, 'MW', 'SIE', 'Solar capacity additions and grid stats', 'Dominican Republic', 'Q1 2026',
 'renewable energy generation reached 24.3% of total dispatched energy',
 1.0, 0.85, 1.0, 0.80, 0.10, 0.84, NULL),

('c0000001-0001-4000-8000-000000000003', 'd0000001-0001-4000-8000-000000000003',
 'DGM confirms rare earth element concentrations in Samaná Peninsula. Estimated 12,000–18,000 tonnes TREO. Phase II drilling recommended.',
 18000, 'tonnes', 'DGM', 'Rare earth discovery confirmation', 'Samaná Peninsula', '2026',
 'confirming anomalous concentrations of light rare earth elements including cerium, lanthanum, and neodymium',
 1.0, 0.90, 0.95, 0.85, 0.30, 0.82, NULL),

('c0000001-0001-4000-8000-000000000004', 'd0000001-0001-4000-8000-000000000004',
 'USGS assesses Caribbean Basin rare earth potential. DR Samaná and Cordillera Central show moderate-to-high potential. Strategic significance for North American supply chain.',
 NULL, NULL, 'USGS', 'Caribbean rare earth assessment', 'Samaná, Cordillera Central', '2026',
 'moderate-to-high potential for light rare earth deposits',
 1.0, 0.85, 0.90, 0.80, 0.25, 0.80, NULL),

('c0000001-0001-4000-8000-000000000005', 'd0000001-0001-4000-8000-000000000005',
 'DR GDP growth at 5.1% YoY Q4 2025. FDI inflows $4.2B in 2025 (+12%). Energy sector attracted $680M in new commitments. GDP forecast 4.8% for 2026.',
 5.1, '%', 'Banco Central', 'GDP growth and FDI statistics', 'Dominican Republic', 'Q4 2025',
 'GDP growth of 5.1% year-over-year for Q4 2025, with construction and free zone sectors leading',
 1.0, 0.80, 1.0, 0.75, 0.10, 0.80, 4200000000),

('c0000001-0001-4000-8000-000000000006', 'd0000001-0001-4000-8000-000000000006',
 'World Bank approves $150M climate-smart agriculture credit line for DR. Includes $30M concessional window for community-scale renewable energy under 5 MW.',
 150, 'million USD', 'World Bank', 'Climate-smart credit line approval', 'Dominican Republic', 'Q2 2026',
 'approved a $150 million credit line for the Dominican Republic''s Climate-Smart Agriculture',
 0.9, 0.90, 0.95, 0.85, 0.10, 0.83, 150000000),

('c0000001-0001-4000-8000-000000000007', 'd0000001-0001-4000-8000-000000000007',
 'IDB Invest announces $85M financing framework for DR Digital Infrastructure Corridor. Targets submarine cables, fiber backbone, edge data centers.',
 85, 'million USD', 'IDB Invest', 'Digital infrastructure financing', 'Santo Domingo–Santiago–Puerto Plata', '2026',
 '$85 million financing framework for the Dominican Republic''s Digital Infrastructure Corridor',
 0.9, 0.85, 0.95, 0.85, 0.10, 0.82, 85000000),

('c0000001-0001-4000-8000-000000000008', 'd0000001-0001-4000-8000-000000000009',
 'DP World commits $200M to Caucedo port Phase III expansion. Adds 450m berth capacity, 2.5M TEU throughput, LNG bunkering facility. Completion Q4 2027.',
 200, 'million USD', 'DP World', 'Port expansion Phase III', 'Caucedo', '2026–2027',
 'committed $200 million to Phase III expansion of the Caucedo multimodal port',
 0.9, 0.90, 0.90, 0.85, 0.15, 0.81, 200000000),

('c0000001-0001-4000-8000-000000000009', 'd0000001-0001-4000-8000-000000000010',
 'EGE Haina commissions 25 MW / 50 MWh BESS at Quisqueya II complex. Provides frequency regulation, peak shifting, spinning reserve. Second utility-scale BESS in DR.',
 50, 'MWh', 'EGE Haina', 'BESS commissioning', 'San Pedro de Macorís', 'Q1 2026',
 'successful commissioning of its 25 MW / 50 MWh battery energy storage system',
 0.9, 0.80, 0.95, 0.80, 0.10, 0.79, NULL),

('c0000001-0001-4000-8000-000000000010', 'd0000001-0001-4000-8000-000000000011',
 'Altice activates 5G trial in Santiago — 3.5 GHz n78 band, 800+ Mbps downlink, sub-10ms latency. Commercial launch pending 2026 spectrum auction.',
 800, 'Mbps', 'Altice Dominicana', '5G trial activation', 'Santiago de los Caballeros', 'Q1 2026',
 'activated a limited 5G trial network covering the Pontezuela–Monument corridor',
 0.9, 0.75, 0.90, 0.80, 0.15, 0.76, NULL),

('c0000001-0001-4000-8000-000000000011', 'd0000001-0001-4000-8000-000000000014',
 'INDOTEL approves three new fiber optic backbone corridors. Combined investment exceeds $120M. Targets 95% household broadband coverage by 2030.',
 120, 'million USD', 'INDOTEL', 'Fiber optic corridor permits', 'Nationwide', '2026',
 'three new fiber optic backbone corridors connecting underserved regions',
 0.7, 0.80, 0.95, 0.80, 0.10, 0.74, 120000000),

('c0000001-0001-4000-8000-000000000012', 'd0000001-0001-4000-8000-000000000008',
 'ProDominicana reports 14 new free zone companies in Q1 2026. Santiago Logistics Hub attracts $42M. 3,200 new direct jobs. Free zone exports at $2.1B trailing 12 months.',
 42, 'million USD', 'ProDominicana', 'Free zone investment report', 'Santiago', 'Q1 2026',
 '14 new free zone companies registered in Q1 2026, generating an estimated 3,200 direct jobs',
 0.9, 0.75, 1.0, 0.75, 0.10, 0.77, 42000000),

('c0000001-0001-4000-8000-000000000013', 'd0000001-0001-4000-8000-000000000012',
 'Proyecto Solar Baní obtains all permits from CNE, ETED, and Ministry of Environment. $55M investment. 300 construction jobs. First integrated solar+BESS in DR.',
 55, 'million USD', 'CNE/ETED/Medio Ambiente', 'All permits secured for Baní solar', 'Baní, Peravia', '2026',
 'obtenido todas las autorizaciones necesarias de la CNE, ETED y el Ministerio de Medio Ambiente',
 0.7, 0.85, 1.0, 0.85, 0.15, 0.76, 55000000),

('c0000001-0001-4000-8000-000000000014', 'd0000001-0001-4000-8000-000000000013',
 'DGM confirms rare earth presence in Samaná: cerium and neodymium. USGS collaboration. Positions DR as critical mineral supplier for North America.',
 NULL, NULL, 'DGM', 'Rare earth confirmation for strategic supply', 'Samaná', '2026',
 'confirmó la presencia de tierras raras en la península de Samaná',
 0.7, 0.85, 1.0, 0.80, 0.30, 0.72, NULL),

('c0000001-0001-4000-8000-000000000015', 'd0000001-0001-4000-8000-000000000015',
 'Santiago Free Zone Hub attracts $42M in Q1 2026. New medical device, automotive, and cold-chain tenants. 1,500 permanent jobs. 15-hectare expansion parcel in development.',
 42, 'million USD', 'Santiago FZ Authority', 'Free zone expansion', 'Santiago', 'Q1 2026',
 'Santiago Logistics Hub has attracted $42 million in new investment commitments',
 0.7, 0.75, 1.0, 0.75, 0.10, 0.72, 42000000),

('c0000001-0001-4000-8000-000000000016', 'd0000001-0001-4000-8000-000000000016',
 'AIRD publishes voluntary carbon market framework. Targets 500,000 tCO2e tradeable volume by 2028. Eligible projects: solar >1MW, industrial efficiency, EV fleet conversion.',
 500000, 'tCO2e/yr', 'AIRD', 'Carbon market pilot framework', 'Dominican Republic', '2028',
 'framework for a voluntary carbon market pilot',
 0.7, 0.80, 0.90, 0.80, 0.15, 0.72, NULL),

('c0000001-0001-4000-8000-000000000017', 'd0000001-0001-4000-8000-000000000017',
 'Local reports confirm survey crews active at Baní solar site near Sabana Buey. Land acquisition complete. Site classified as marginal grazing land.',
 NULL, NULL, 'Community reports', 'Ground-truthing of Baní solar project', 'Baní, Sabana Buey', 'Feb 2026',
 'users report seeing survey crews on the site near Sabana Buey',
 0.4, 0.60, 1.0, 0.65, 0.20, 0.53, NULL),

('c0000001-0001-4000-8000-000000000018', 'd0000001-0001-4000-8000-000000000018',
 'Analysts estimate Samaná rare earth revenue potential at $50–100M annually if deposits prove commercial. Minimum 5–7 years to production under fast-track permitting.',
 100, 'million USD/yr', 'Energy analysts', 'Revenue estimate for Samaná REE', 'Samaná', '2031+',
 'Potential revenue estimated at $50-100M annually if deposits prove commercial',
 0.4, 0.70, 0.95, 0.70, 0.35, 0.51, 100000000)

ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────
-- Relationships between entities
-- ──────────────────────────────────────────────
INSERT INTO relationships (from_entity_id, to_entity_id, relation_type, doc_id, confidence) VALUES
('e0000001-0001-4000-8000-000000000001', 'e0000001-0001-4000-8000-000000000003', 'regulates', 'd0000001-0001-4000-8000-000000000001', 0.95),
('e0000001-0001-4000-8000-000000000007', 'e0000001-0001-4000-8000-000000000010', 'partners_with', 'd0000001-0001-4000-8000-000000000003', 0.90),
('e0000001-0001-4000-8000-000000000014', 'e0000001-0001-4000-8000-000000000012', 'finances', 'd0000001-0001-4000-8000-000000000006', 0.90),
('e0000001-0001-4000-8000-000000000018', 'e0000001-0001-4000-8000-000000000019', 'operates', 'd0000001-0001-4000-8000-000000000009', 0.95),
('e0000001-0001-4000-8000-000000000016', 'e0000001-0001-4000-8000-000000000025', 'finances', 'd0000001-0001-4000-8000-000000000007', 0.85)
ON CONFLICT DO NOTHING;

-- ──────────────────────────────────────────────
-- Audit log entries (simulates operational history)
-- ──────────────────────────────────────────────
INSERT INTO audit_log (event_type, entity_type, entity_id, payload, created_at) VALUES
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000001', '{"source_id":"cne-gob-do","url":"https://cne.gob.do/resoluciones/res-2026-018"}', NOW() - interval '6 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000002', '{"source_id":"sie-gob-do","url":"https://sie.gob.do/data/generation-q1-2026"}', NOW() - interval '7 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000003', '{"source_id":"dgm-gob-do","url":"https://dgm.gob.do/mining/samana-ree-survey-2026"}', NOW() - interval '1 day'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000004', '{"source_id":"usgs-gov","url":"https://pubs.usgs.gov/of/2026/caribbean-ree-assessment"}', NOW() - interval '2 days'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000005', '{"source_id":"bancentral-gov-do","url":"https://bancentral.gob.do/estadisticas/ipc-2026-02"}', NOW() - interval '7 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000001', '{"entities":4,"events":1,"claims":1}', NOW() - interval '5 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000002', '{"entities":2,"events":0,"claims":1}', NOW() - interval '6 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000003', '{"entities":3,"events":1,"claims":1}', NOW() - interval '23 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000004', '{"entities":2,"events":0,"claims":1}', NOW() - interval '47 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000005', '{"entities":2,"events":1,"claims":1}', NOW() - interval '6 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000006', '{"source_id":"worldbank-org","url":"https://worldbank.org/projects/dr-climate-smart-credit"}', NOW() - interval '1 day'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000007', '{"source_id":"idb-org","url":"https://idb.org/projects/dr-digital-infrastructure"}', NOW() - interval '1 day'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000008', '{"source_id":"prodominicana-gob","url":"https://prodominicana.gob.do/inversiones/free-zone-q1-2026"}', NOW() - interval '8 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000009', '{"source_id":"dpworld-com","url":"https://dpworld.com/caucedo/expansion-2026-update"}', NOW() - interval '3 days'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000010', '{"source_id":"egehaina-com","url":"https://egehaina.com/noticias/bess-san-pedro-commissioning"}', NOW() - interval '1 day'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000011', '{"source_id":"altice-com-do","url":"https://altice.com.do/5g-trial-santiago"}', NOW() - interval '2 days'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000006', '{"entities":2,"events":1,"claims":1}', NOW() - interval '23 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000007', '{"entities":2,"events":1,"claims":1}', NOW() - interval '22 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000008', '{"entities":2,"events":0,"claims":1}', NOW() - interval '7 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000009', '{"entities":3,"events":1,"claims":1}', NOW() - interval '71 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000010', '{"entities":2,"events":1,"claims":1}', NOW() - interval '23 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000011', '{"entities":2,"events":1,"claims":1}', NOW() - interval '47 hours'),
('alert.sent', 'alert', 'convergence-phase-change', '{"phase":"accelerating","index":62,"trigger":"energy+mining momentum"}', NOW() - interval '3 hours'),
('robots.denied', 'source', 'diariolibre-com', '{"path":"/api/search","reason":"Disallowed by robots.txt"}', NOW() - interval '4 hours'),
('error.fetch', 'source', 'hoy-com-do', '{"error":"timeout","url":"https://hoy.com.do/economia/timeout-page"}', NOW() - interval '5 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000012', '{"source_id":"diariolibre-com"}', NOW() - interval '8 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000013', '{"source_id":"listin-com-do"}', NOW() - interval '7 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000014', '{"source_id":"eldinero-com-do"}', NOW() - interval '1 day'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000015', '{"source_id":"hoy-com-do"}', NOW() - interval '7 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000016', '{"source_id":"aird-org-do"}', NOW() - interval '2 days'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000017', '{"source_id":"reddit-domrep"}', NOW() - interval '8 hours'),
('document.stored', 'document', 'd0000001-0001-4000-8000-000000000018', '{"source_id":"x-dr-energy"}', NOW() - interval '7 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000012', '{"entities":3,"events":1,"claims":1}', NOW() - interval '7 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000013', '{"entities":2,"events":0,"claims":1}', NOW() - interval '6 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000014', '{"entities":2,"events":0,"claims":1}', NOW() - interval '23 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000015', '{"entities":2,"events":0,"claims":1}', NOW() - interval '6 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000016', '{"entities":1,"events":0,"claims":1}', NOW() - interval '47 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000017', '{"entities":0,"events":0,"claims":1}', NOW() - interval '7 hours'),
('extraction.completed', 'document', 'd0000001-0001-4000-8000-000000000018', '{"entities":0,"events":0,"claims":1}', NOW() - interval '6 hours');

-- ──────────────────────────────────────────────
-- Proof Registry (blockchain anchoring)
-- NOTE: No ON CONFLICT — PostgreSQL RULES on this table block ON CONFLICT clauses
-- ──────────────────────────────────────────────
INSERT INTO proof_registry (document_hash, chain_id, chain_tx_hash, block_number, anchored_at, created_at) VALUES
('sha256_cne_res2026018_v1', 'polygon', '0x7a2f8e3c4d5b6a1f9e0d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2e4c1', 54283910, NOW() - interval '2 days', NOW() - interval '2 days'),
('sha256_dgm_samana_ree_2026', 'polygon', '0x3e5b9c1d2a3f4e5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a7f2', 54290122, NOW() - interval '3 days', NOW() - interval '3 days'),
('sha256_wb_climate_credit', 'polygon', '0x9c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2b3e8', 54295340, NOW() - interval '5 days', NOW() - interval '5 days'),
('sha256_dpworld_caucedo_ph3', 'polygon', NULL, NULL, NULL, NOW() - interval '1 day'),
('sha256_egehaina_bess_spm', 'polygon', NULL, NULL, NULL, NOW() - interval '1 day');
