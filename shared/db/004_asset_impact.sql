-- DICS Migration 004: Asset Impact Engine
-- Adds sector/location normalization, exposure/proximity weighting,
-- and the asset_impact output table.

-- ──────────────────────────────────────────────
-- 1. Claim normalization columns
-- ──────────────────────────────────────────────
ALTER TABLE claims ADD COLUMN IF NOT EXISTS sector_normalized TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS location_normalized TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS capital_intensity REAL NOT NULL DEFAULT 0.5;

CREATE INDEX IF NOT EXISTS idx_claims_sector   ON claims (sector_normalized);
CREATE INDEX IF NOT EXISTS idx_claims_location ON claims (location_normalized);

-- ──────────────────────────────────────────────
-- 2. Asset sector exposure mapping
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_exposure (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sector          TEXT        NOT NULL,
    exposure_weight NUMERIC(4,2) NOT NULL CHECK (exposure_weight BETWEEN 0 AND 1),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, sector)
);
CREATE INDEX IF NOT EXISTS idx_asset_exposure_proj ON asset_exposure (project_id);

-- ──────────────────────────────────────────────
-- 3. Asset location proximity mapping
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_location (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id       TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    location         TEXT        NOT NULL,
    proximity_weight NUMERIC(4,2) NOT NULL CHECK (proximity_weight BETWEEN 0 AND 1),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, location)
);
CREATE INDEX IF NOT EXISTS idx_asset_location_proj ON asset_location (project_id);

-- ──────────────────────────────────────────────
-- 4. Asset impact output table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asset_impact (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id       TEXT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    claim_id         UUID        NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    sector           TEXT,
    location         TEXT,
    composite_score  REAL        NOT NULL DEFAULT 0,
    sector_weight    REAL        NOT NULL DEFAULT 0,
    location_weight  REAL        NOT NULL DEFAULT 0,
    capital_mod      REAL        NOT NULL DEFAULT 1.0,
    impact_score     REAL        NOT NULL DEFAULT 0,
    risk_delta       REAL        NOT NULL DEFAULT 0,
    opportunity_delta REAL       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, claim_id)
);
CREATE INDEX IF NOT EXISTS idx_asset_impact_proj    ON asset_impact (project_id);
CREATE INDEX IF NOT EXISTS idx_asset_impact_created ON asset_impact (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_impact_score   ON asset_impact (impact_score DESC);

-- ──────────────────────────────────────────────
-- 5. Daily brief archive table
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_briefs (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_date       DATE        NOT NULL UNIQUE,
    convergence_phase TEXT       NOT NULL DEFAULT 'Monitoring',
    convergence_index REAL       NOT NULL DEFAULT 0,
    risk_level       TEXT        NOT NULL DEFAULT 'Moderate',
    capital_window   TEXT        NOT NULL DEFAULT 'Neutral',
    sector_momentum  JSONB       NOT NULL DEFAULT '{}',
    asset_impacts    JSONB       NOT NULL DEFAULT '{}',
    narrative        TEXT,
    claims_count     INT         NOT NULL DEFAULT 0,
    docs_count       INT         NOT NULL DEFAULT 0,
    pdf_url          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- 6. Seed exposure weights
-- ──────────────────────────────────────────────
INSERT INTO asset_exposure (project_id, sector, exposure_weight) VALUES
    -- SunFarm Baní: solar + BESS, heavy energy/finance, light telecom
    ('SUNFARM_BANI_50MW', 'energy',    0.90),
    ('SUNFARM_BANI_50MW', 'finance',   0.50),
    ('SUNFARM_BANI_50MW', 'mining',    0.10),
    ('SUNFARM_BANI_50MW', 'telecom',   0.10),
    ('SUNFARM_BANI_50MW', 'logistics', 0.20),
    ('SUNFARM_BANI_50MW', 'tourism',   0.05),
    ('SUNFARM_BANI_50MW', 'macro',     0.40),
    -- Cabrera: ecotourism + mixed-use, heavy tourism/logistics
    ('CABRERA_ECOTURISMO', 'tourism',   0.85),
    ('CABRERA_ECOTURISMO', 'logistics', 0.60),
    ('CABRERA_ECOTURISMO', 'energy',    0.40),
    ('CABRERA_ECOTURISMO', 'telecom',   0.30),
    ('CABRERA_ECOTURISMO', 'finance',   0.45),
    ('CABRERA_ECOTURISMO', 'mining',    0.05),
    ('CABRERA_ECOTURISMO', 'macro',     0.35)
ON CONFLICT (project_id, sector) DO NOTHING;

-- ──────────────────────────────────────────────
-- 7. Seed location proximity weights
-- ──────────────────────────────────────────────
INSERT INTO asset_location (project_id, location, proximity_weight) VALUES
    -- SunFarm
    ('SUNFARM_BANI_50MW', 'bani',           1.00),
    ('SUNFARM_BANI_50MW', 'santo_domingo',  0.60),
    ('SUNFARM_BANI_50MW', 'national',       0.50),
    ('SUNFARM_BANI_50MW', 'pedernales',     0.30),
    ('SUNFARM_BANI_50MW', 'samana',         0.15),
    ('SUNFARM_BANI_50MW', 'cabrera',        0.10),
    -- Cabrera
    ('CABRERA_ECOTURISMO', 'cabrera',        1.00),
    ('CABRERA_ECOTURISMO', 'samana',         0.70),
    ('CABRERA_ECOTURISMO', 'santo_domingo',  0.40),
    ('CABRERA_ECOTURISMO', 'national',       0.40),
    ('CABRERA_ECOTURISMO', 'pedernales',     0.15),
    ('CABRERA_ECOTURISMO', 'bani',           0.10)
ON CONFLICT (project_id, location) DO NOTHING;

-- ──────────────────────────────────────────────
-- 8. SQL function: compute_asset_impact
--    Call: SELECT compute_asset_impact();
--    Recomputes asset_impact for all claims × all projects
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION compute_asset_impact()
RETURNS INT AS $$
DECLARE
    rows_written INT := 0;
BEGIN
    INSERT INTO asset_impact (
        project_id, claim_id, sector, location,
        composite_score, sector_weight, location_weight, capital_mod,
        impact_score, risk_delta, opportunity_delta
    )
    SELECT
        p.id                              AS project_id,
        c.id                              AS claim_id,
        c.sector_normalized               AS sector,
        c.location_normalized             AS location,
        c.composite_score,
        COALESCE(ae.exposure_weight, 0.1) AS sector_weight,
        COALESCE(al.proximity_weight, 0.3) AS location_weight,
        c.capital_intensity               AS capital_mod,
        -- impact_score = composite × sector × location × capital_intensity
        ROUND((
            c.composite_score
            * COALESCE(ae.exposure_weight, 0.1)
            * COALESCE(al.proximity_weight, 0.3)
            * c.capital_intensity
        )::numeric, 4)                    AS impact_score,
        -- risk_delta: negative impact from risk component
        ROUND((
            -1.0 * c.risk
            * COALESCE(ae.exposure_weight, 0.1)
            * COALESCE(al.proximity_weight, 0.3)
        )::numeric, 4)                    AS risk_delta,
        -- opportunity_delta: positive impact from opportunity component
        ROUND((
            c.opportunity
            * COALESCE(ae.exposure_weight, 0.1)
            * COALESCE(al.proximity_weight, 0.3)
        )::numeric, 4)                    AS opportunity_delta
    FROM claims c
    CROSS JOIN projects p
    LEFT JOIN asset_exposure ae
        ON ae.project_id = p.id AND ae.sector = c.sector_normalized
    LEFT JOIN asset_location al
        ON al.project_id = p.id AND al.location = c.location_normalized
    WHERE c.sector_normalized IS NOT NULL
    ON CONFLICT (project_id, claim_id) DO UPDATE SET
        sector           = EXCLUDED.sector,
        location         = EXCLUDED.location,
        composite_score  = EXCLUDED.composite_score,
        sector_weight    = EXCLUDED.sector_weight,
        location_weight  = EXCLUDED.location_weight,
        capital_mod      = EXCLUDED.capital_mod,
        impact_score     = EXCLUDED.impact_score,
        risk_delta       = EXCLUDED.risk_delta,
        opportunity_delta = EXCLUDED.opportunity_delta,
        created_at       = NOW();

    GET DIAGNOSTICS rows_written = ROW_COUNT;
    RETURN rows_written;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────
-- 9. View: asset_impact_summary
--    Aggregates per project for dashboard use
-- ──────────────────────────────────────────────
CREATE OR REPLACE VIEW asset_impact_summary AS
SELECT
    p.id                          AS project_id,
    p.name                        AS project_name,
    COUNT(ai.id)                  AS total_signals,
    ROUND(AVG(ai.impact_score)::numeric, 4)     AS avg_impact,
    ROUND(SUM(ai.impact_score)::numeric, 4)     AS total_impact,
    ROUND(AVG(ai.risk_delta)::numeric, 4)       AS avg_risk_delta,
    ROUND(AVG(ai.opportunity_delta)::numeric, 4) AS avg_opp_delta,
    -- 7-day window
    COUNT(ai.id) FILTER (WHERE ai.created_at > NOW() - interval '7 days')   AS signals_7d,
    ROUND(AVG(ai.impact_score) FILTER (WHERE ai.created_at > NOW() - interval '7 days')::numeric, 4) AS avg_impact_7d,
    ROUND(AVG(ai.risk_delta) FILTER (WHERE ai.created_at > NOW() - interval '7 days')::numeric, 4)   AS avg_risk_7d,
    ROUND(AVG(ai.opportunity_delta) FILTER (WHERE ai.created_at > NOW() - interval '7 days')::numeric, 4) AS avg_opp_7d
FROM projects p
LEFT JOIN asset_impact ai ON ai.project_id = p.id
GROUP BY p.id, p.name;
