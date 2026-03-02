-- DICS PostgreSQL Schema — Migration 001
-- Requires: pgvector extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ──────────────────────────────────────────────
-- Source cache (ETag / Last-Modified per source)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS source_cache (
    source_id        TEXT PRIMARY KEY,
    etag             TEXT,
    last_modified    TEXT,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Raw + clean documents
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id       TEXT        NOT NULL,
    url             TEXT        NOT NULL,
    title           TEXT,
    clean_text      TEXT        NOT NULL,
    raw_html        TEXT,
    content_hash    TEXT        NOT NULL UNIQUE,
    status_code     SMALLINT,
    tier            SMALLINT    NOT NULL DEFAULT 3,
    tags            TEXT[]      NOT NULL DEFAULT '{}',
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    extracted_at    TIMESTAMPTZ,
    failed_at       TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_documents_source_id  ON documents (source_id);
CREATE INDEX IF NOT EXISTS idx_documents_fetched_at ON documents (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_unprocessed
    ON documents (fetched_at) WHERE extracted_at IS NULL AND failed_at IS NULL;

-- ──────────────────────────────────────────────
-- Extracted entities
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id      UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL,  -- PERSON | ORG | GPE | ASSET | PERMIT | ...
    text        TEXT        NOT NULL,
    normalized  TEXT        NOT NULL,
    start_char  INT,
    end_char    INT,
    confidence  REAL        NOT NULL DEFAULT 1.0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_entities_doc_id     ON entities (doc_id);
CREATE INDEX IF NOT EXISTS idx_entities_normalized ON entities (normalized);
CREATE INDEX IF NOT EXISTS idx_entities_type       ON entities (type);

-- ──────────────────────────────────────────────
-- Detected events
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id      UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL,
    description TEXT,
    entity_ids  UUID[]      NOT NULL DEFAULT '{}',
    raw_text    TEXT,
    confidence  REAL        NOT NULL DEFAULT 1.0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_doc_id ON events (doc_id);
CREATE INDEX IF NOT EXISTS idx_events_type   ON events (type);

-- ──────────────────────────────────────────────
-- Scored claims (primary RAG candidates)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS claims (
    id               UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
    doc_id           UUID  NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    statement        TEXT  NOT NULL,
    quantity         REAL,
    unit             TEXT,
    who              TEXT,
    what             TEXT,
    where_text       TEXT,
    when_text        TEXT,
    excerpt          TEXT,
    credibility      REAL  NOT NULL DEFAULT 0.5,
    materiality      REAL  NOT NULL DEFAULT 0.5,
    recency          REAL  NOT NULL DEFAULT 1.0,
    opportunity      REAL  NOT NULL DEFAULT 0.5,
    risk             REAL  NOT NULL DEFAULT 0.2,
    composite_score  REAL  NOT NULL DEFAULT 0.5,
    usd_amount       BIGINT,
    embedding        vector(384),   -- all-MiniLM-L6-v2 dims
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claims_doc_id    ON claims (doc_id);
CREATE INDEX IF NOT EXISTS idx_claims_composite ON claims (composite_score DESC);
-- IVFFlat index for ANN search (create after initial bulk load)
-- CREATE INDEX ON claims USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ──────────────────────────────────────────────
-- Relationships between entities
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS relationships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    to_entity_id    UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relation_type   TEXT NOT NULL, -- finances | owns | operates | regulates | partners_with
    doc_id          UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    confidence      REAL NOT NULL DEFAULT 0.5,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (from_entity_id, to_entity_id, relation_type, doc_id)
);
CREATE INDEX IF NOT EXISTS idx_relationships_from ON relationships (from_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to   ON relationships (to_entity_id);

-- ──────────────────────────────────────────────
-- Append-only audit log (never deleted)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id           BIGSERIAL   PRIMARY KEY,
    event_type   TEXT        NOT NULL,
    entity_type  TEXT,
    entity_id    TEXT,
    payload      JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity   ON audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created  ON audit_log (created_at DESC);

-- Prevent updates/deletes on audit_log
CREATE OR REPLACE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;

-- ──────────────────────────────────────────────
-- Blockchain proof registry (cryptographic anchoring extension)
-- Stores on-chain transaction references for report/document hashes.
-- Once inserted, rows must never be modified — enforced by rules below.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proof_registry (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_hash   TEXT        NOT NULL UNIQUE,
    chain_id        TEXT        NOT NULL DEFAULT 'polygon', -- ethereum | polygon | xrpl | private
    chain_tx_hash   TEXT,                                   -- on-chain transaction hash
    block_number    BIGINT,
    anchored_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proof_registry_hash ON proof_registry (document_hash);

CREATE OR REPLACE RULE proof_registry_no_delete AS ON DELETE TO proof_registry DO INSTEAD NOTHING;
CREATE OR REPLACE RULE proof_registry_no_update AS ON UPDATE TO proof_registry DO INSTEAD NOTHING;

