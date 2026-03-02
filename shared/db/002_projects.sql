-- DICS PostgreSQL Schema — Migration 002: Projects & Real Assets
-- Adds the "bankable asset dossier" layer for SunFarm, Cabrera, etc.

-- ──────────────────────────────────────────────
-- Projects (top-level asset records)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id              TEXT PRIMARY KEY,                    -- e.g. SUNFARM_BANI_50MW, CABRERA_ECOTURISMO
    name            TEXT        NOT NULL,
    type            TEXT        NOT NULL,                -- solar | ecotourism | logistics | mixed
    status          TEXT        NOT NULL DEFAULT 'concept',  -- concept | pre-development | shovel-ready | construction | operational
    location        TEXT,
    province        TEXT,
    municipality    TEXT,
    country         TEXT        NOT NULL DEFAULT 'DO',
    lat             REAL,
    lng             REAL,
    land_area_m2    REAL,
    summary         TEXT,
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Project metrics (KPIs — MW, MWh, CAPEX, IRR, etc.)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_metrics (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metric_key  TEXT        NOT NULL,  -- mw_ac | mw_dc | mwh_bess | capex_usd | irr | dscr | land_value_usd | ...
    value_num   REAL,
    value_text  TEXT,
    unit        TEXT,
    source_doc  TEXT,                  -- reference to proof document
    as_of       DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, metric_key, as_of)
);
CREATE INDEX IF NOT EXISTS idx_project_metrics_proj ON project_metrics (project_id);

-- ──────────────────────────────────────────────
-- Project documents (maps docs → project)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    doc_id      UUID        REFERENCES documents(id) ON DELETE SET NULL,
    doc_type    TEXT        NOT NULL,  -- permit | financial_model | site_plan | environmental | title | ppa_draft | memo | masterplan
    title       TEXT        NOT NULL,
    file_path   TEXT,
    file_hash   TEXT,                  -- SHA-256
    status      TEXT        NOT NULL DEFAULT 'pending',  -- pending | verified | expired
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_documents_proj ON project_documents (project_id);

-- ──────────────────────────────────────────────
-- Counterparties (who's involved in deals)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS counterparties (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    role        TEXT        NOT NULL,  -- offtaker | epc | dfi | insurer | regulator | designer | surveyor | lender | investor
    entity_type TEXT,                  -- government | corporate | multilateral | ngo | individual
    status      TEXT        NOT NULL DEFAULT 'identified', -- identified | engaged | term_sheet | contracted
    contact     TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_counterparties_proj ON counterparties (project_id);

-- ──────────────────────────────────────────────
-- PPAs (power purchase agreements — SunFarm etc.)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ppas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    offtaker        TEXT        NOT NULL,
    price_usd_mwh   REAL        NOT NULL,
    escalation_pct  REAL        NOT NULL DEFAULT 1.5,
    term_years      INT         NOT NULL DEFAULT 25,
    capacity_mw     REAL,
    status          TEXT        NOT NULL DEFAULT 'draft',  -- draft | offered | negotiating | executed | expired
    effective_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ppas_proj ON ppas (project_id);

-- ──────────────────────────────────────────────
-- Funding pathways (each financing lane + evidence)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS funding_pathways (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    pathway         TEXT        NOT NULL,  -- green_bond | dfi_blended | carbon_forward | miga_opic | vendor_finance | ppp | sll | presales | etc.
    label           TEXT        NOT NULL,
    target_usd      BIGINT,
    status          TEXT        NOT NULL DEFAULT 'identified', -- identified | qualifying | application | approved | disbursing | closed
    institution     TEXT,
    evidence_checklist JSONB    NOT NULL DEFAULT '[]',  -- [{item, status, doc_hash}]
    next_action     TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_funding_pathways_proj ON funding_pathways (project_id);

-- ──────────────────────────────────────────────
-- Term sheets (versioned, signed/draft)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS term_sheets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    pathway_id  UUID        REFERENCES funding_pathways(id) ON DELETE SET NULL,
    version     INT         NOT NULL DEFAULT 1,
    status      TEXT        NOT NULL DEFAULT 'draft',  -- draft | sent | counter | executed | expired
    file_hash   TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_term_sheets_proj ON term_sheets (project_id);

-- ──────────────────────────────────────────────
-- Permits & approvals checklist
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permits (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    permit_type TEXT        NOT NULL,  -- cne_concession | eted_interconnection | environmental | land_title | uso_suelo | municipal | water_rights
    authority   TEXT,
    status      TEXT        NOT NULL DEFAULT 'required', -- required | applied | granted | expired | waived
    doc_hash    TEXT,                  -- SHA-256 of proof document
    granted_at  DATE,
    expires_at  DATE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_permits_proj ON permits (project_id);

-- ──────────────────────────────────────────────
-- Seed: SunFarm Baní 50MW project
-- ──────────────────────────────────────────────
INSERT INTO projects (id, name, type, status, location, province, municipality, land_area_m2, summary, tags)
VALUES (
    'SUNFARM_BANI_50MW',
    'SunFarm Baní — 50 MW Solar + 25 MW BESS',
    'solar',
    'shovel-ready',
    'Baní, Peravia Province',
    'Peravia',
    'Baní',
    NULL,
    '50 MW AC / 59.69 MWp DC photovoltaic plant with 25 MW / 100 MWh battery energy storage system. Shovel-ready with CNE concession, ETED interconnection approval, environmental license, and land title secured. PPA target $70/MWh, 25-year term, 1.5% escalation.',
    ARRAY['solar', 'bess', 'energy', 'ppa', 'shovel-ready']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO projects (id, name, type, status, location, province, municipality, land_area_m2, summary, tags)
VALUES (
    'CABRERA_ECOTURISMO',
    'Proyecto Ecoturístico Cabrera — Mixed-Use Destination',
    'ecotourism',
    'concept',
    'Cabrera, María Trinidad Sánchez',
    'María Trinidad Sánchez',
    'Cabrera',
    1169936,
    'Large-scale mixed-use ecotourism district: 1.17M m² master-planned development featuring residential villas (A/B/C types), 200-unit apartment complex, commercial center, anchor supermarket, recreational zone (lakes, amphitheater, clubhouse), service infrastructure (fire station, medical dispensary, electrical substation). Terrain 100–300m elevation. Total project value $593M, land contribution $93M.',
    ARRAY['ecotourism', 'real_estate', 'mixed_use', 'hospitality', 'land']
) ON CONFLICT (id) DO NOTHING;

-- ── SunFarm seed metrics ────────────────────────────────────────
INSERT INTO project_metrics (project_id, metric_key, value_num, unit, source_doc) VALUES
    ('SUNFARM_BANI_50MW', 'mw_ac',           50,       'MW',   'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'mw_dc',           59.69,    'MWp',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'mwh_bess',        100,      'MWh',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'mw_bess',         25,       'MW',   'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'capex_usd',       55000000, 'USD',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'acquisition_usd', 35000000, 'USD',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'total_basis_usd', 90000000, 'USD',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'debt_pct',        60,       '%',    'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'debt_usd',        33000000, 'USD',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'debt_rate',        6.5,     '%',    'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'debt_tenor_yr',   18,       'years','sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'equity_pct',      40,       '%',    'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'equity_usd',      22000000, 'USD',  'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'ppa_price',       70,       'USD/MWh','sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'ppa_escalation',  1.5,      '%/yr', 'sunfarm-platform'),
    ('SUNFARM_BANI_50MW', 'ppa_term',        25,       'years','sunfarm-platform')
ON CONFLICT DO NOTHING;

-- ── Cabrera seed metrics ────────────────────────────────────────
INSERT INTO project_metrics (project_id, metric_key, value_num, unit, source_doc) VALUES
    ('CABRERA_ECOTURISMO', 'land_area_m2',    1169936,    'm²',    'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'total_value_usd', 593626480,  'USD',   'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'land_value_usd',  93025480,   'USD',   'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'dev_cost_usd',    150000000,  'USD',   'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'expansion_usd',   349400000,  'USD',   'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'revenue_proj_usd',176400000,  'USD',   'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'elevation_low_m', 100,        'm',     'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'elevation_high_m',300,        'm',     'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'villa_a_units',   40,         'units', 'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'villa_b_units',   60,         'units', 'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'villa_c_units',   80,         'units', 'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'apartment_units', 200,        'units', 'cabrera-masterplan-pdf'),
    ('CABRERA_ECOTURISMO', 'green_area_m2',   66532,      'm²',    'cabrera-masterplan-pdf')
ON CONFLICT DO NOTHING;

-- ── SunFarm seed permits ────────────────────────────────────────
INSERT INTO permits (project_id, permit_type, authority, status, notes) VALUES
    ('SUNFARM_BANI_50MW', 'cne_concession',       'CNE (Comisión Nacional de Energía)',  'granted', 'Generation concession approved'),
    ('SUNFARM_BANI_50MW', 'eted_interconnection',  'ETED',                               'granted', 'Grid interconnection approval secured'),
    ('SUNFARM_BANI_50MW', 'environmental',         'Ministerio de Medio Ambiente',        'granted', 'Environmental license issued'),
    ('SUNFARM_BANI_50MW', 'land_title',            'Registro de Títulos',                 'granted', 'Land title registered')
ON CONFLICT DO NOTHING;

-- ── Cabrera permits (mostly required/pending) ───────────────────
INSERT INTO permits (project_id, permit_type, authority, status, notes) VALUES
    ('CABRERA_ECOTURISMO', 'land_title',      'Registro de Títulos',             'required', 'Certificado de Título needed'),
    ('CABRERA_ECOTURISMO', 'uso_suelo',       'Municipio de Cabrera',            'required', 'Land use / zoning confirmation'),
    ('CABRERA_ECOTURISMO', 'environmental',   'Ministerio de Medio Ambiente',    'required', 'Environmental impact assessment'),
    ('CABRERA_ECOTURISMO', 'municipal',       'Ayuntamiento de Cabrera',         'required', 'Municipal development approval'),
    ('CABRERA_ECOTURISMO', 'water_rights',    'INAPA / INDRHI',                  'required', 'Water supply and rights'),
    ('CABRERA_ECOTURISMO', 'road_access',     'MOPC',                            'required', 'Road access and infrastructure agreement')
ON CONFLICT DO NOTHING;

-- ── SunFarm seed PPA ────────────────────────────────────────────
INSERT INTO ppas (project_id, offtaker, price_usd_mwh, escalation_pct, term_years, capacity_mw, status, notes)
VALUES (
    'SUNFARM_BANI_50MW',
    'TBD — Offtaker Outreach',
    70.00,
    1.5,
    25,
    50,
    'draft',
    'Target PPA: $70/MWh base, 1.5%/yr escalation, 25-year term. BESS value stack: peak shifting, frequency regulation, capacity firming.'
) ON CONFLICT DO NOTHING;

-- ── SunFarm funding pathways ────────────────────────────────────
INSERT INTO funding_pathways (project_id, pathway, label, target_usd, status, institution, next_action) VALUES
    ('SUNFARM_BANI_50MW', 'senior_debt',     'Senior Project Debt',       33000000, 'identified', NULL, 'Secure PPA → approach lenders'),
    ('SUNFARM_BANI_50MW', 'equity',          'Sponsor Equity',            22000000, 'identified', NULL, 'Complete project dossier'),
    ('SUNFARM_BANI_50MW', 'green_bond',      'Green Bond Issuance',       NULL,     'identified', NULL, 'Obtain Green Bond Framework certification'),
    ('SUNFARM_BANI_50MW', 'dfi_blended',     'DFI Blended Finance',       NULL,     'identified', 'IDB Invest / IFC / DFC', 'Submit project for DFI screening'),
    ('SUNFARM_BANI_50MW', 'carbon_forward',  'Carbon Credit Forward',     NULL,     'identified', NULL, 'Calculate tCO2e/yr methodology'),
    ('SUNFARM_BANI_50MW', 'miga_opic',       'Political Risk Insurance',  NULL,     'identified', 'MIGA / DFC', 'Prepare risk assessment package'),
    ('SUNFARM_BANI_50MW', 'vendor_finance',  'EPC Vendor Finance',        NULL,     'identified', NULL, 'Engage EPC vendors for terms'),
    ('SUNFARM_BANI_50MW', 'sll',             'Sustainability-Linked Loan',NULL,     'identified', NULL, 'Define KPI framework')
ON CONFLICT DO NOTHING;

-- ── Cabrera funding pathways ────────────────────────────────────
INSERT INTO funding_pathways (project_id, pathway, label, target_usd, status, institution, next_action) VALUES
    ('CABRERA_ECOTURISMO', 'land_equity',    'Land-Contributed Equity',   93025480,  'identified', NULL, 'Validate land title + appraisal'),
    ('CABRERA_ECOTURISMO', 'presales',       'Pre-Sales Pipeline',        NULL,      'identified', NULL, 'Launch marketing + reservation system'),
    ('CABRERA_ECOTURISMO', 'dev_finance',    'Phase 1 Project Finance',   150000000, 'identified', NULL, 'Anchor tenant LOIs + infrastructure plan'),
    ('CABRERA_ECOTURISMO', 'anchor_loi',     'Anchor Tenant LOIs',        NULL,      'identified', NULL, 'Approach La Sirena, Blue Mall operators'),
    ('CABRERA_ECOTURISMO', 'tourism_fund',   'Tourism Development Fund',  NULL,      'identified', 'CONFOTUR / IDB', 'Apply for tourism incentive programs'),
    ('CABRERA_ECOTURISMO', 'ppp',            'Public-Private Partnership',NULL,      'identified', 'MOPC / Municipality', 'Infrastructure cost-sharing framework')
ON CONFLICT DO NOTHING;

-- ── SunFarm counterparties ──────────────────────────────────────
INSERT INTO counterparties (project_id, name, role, entity_type, status) VALUES
    ('SUNFARM_BANI_50MW', 'CNE', 'regulator', 'government', 'contracted'),
    ('SUNFARM_BANI_50MW', 'ETED', 'regulator', 'government', 'contracted'),
    ('SUNFARM_BANI_50MW', 'Ministerio de Medio Ambiente', 'regulator', 'government', 'contracted')
ON CONFLICT DO NOTHING;

-- ── Cabrera counterparties ──────────────────────────────────────
INSERT INTO counterparties (project_id, name, role, entity_type, status) VALUES
    ('CABRERA_ECOTURISMO', 'DiseñARQ Studios', 'designer', 'corporate', 'engaged'),
    ('CABRERA_ECOTURISMO', 'TOPOESPINAL', 'surveyor', 'corporate', 'engaged'),
    ('CABRERA_ECOTURISMO', 'Municipio de Cabrera', 'regulator', 'government', 'identified')
ON CONFLICT DO NOTHING;
