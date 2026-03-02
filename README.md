![Node](https://img.shields.io/badge/node-20.x-green)
![Python](https://img.shields.io/badge/python-3.12-blue)
![PostgreSQL](https://img.shields.io/badge/postgres-16-purple)
![Vector](https://img.shields.io/badge/pgvector-enabled-teal)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

# 🌐 **DICS — DR Intelligence Command System**

## Sovereign Infrastructure Intelligence Platform

> A compliance-first, public-source intelligence architecture monitoring strategic infrastructure convergence within the Dominican Republic across mining, energy, connectivity, logistics, telecom, and capital flows.

---

## 🎨 Domain Architecture Legend

| Domain                                | Description                                                      |
| ------------------------------------- | ---------------------------------------------------------------- |
| 🟡 **Mining & Resource Intelligence** | Rare earths, concessions, geological signals                     |
| 🟢 **Energy Infrastructure**          | Solar, BESS, grid, generation, PPAs                              |
| 🔵 **Connectivity & Telecom**         | Subsea cables, data centers, IXPs, spectrum                      |
| 🟠 **Logistics & Trade Corridors**    | Ports, airports, free zones, cargo flows                         |
| 🟣 **Capital Structuring**            | SPVs, project finance, institutional modeling                    |
| 🔴 **Risk & Regulatory Intelligence** | Political, ESG, FX, compliance friction                          |
| ⚫ **Governance & Audit Integrity**    | Chain-of-custody, append-only logs                               |
| 🧠 **Agentic RAG Intelligence Layer** | Vector retrieval, claim citation, anti-hallucination enforcement |

---

# 📖 Executive Overview

**DICS (DR Intelligence Command System)** is a structured intelligence platform designed to detect, score, and prioritize strategic infrastructure signals across the Dominican Republic.

The system operates across three integrated layers:

1. Intelligence Acquisition
2. Structured Extraction & Scoring
3. Capital-Ready Output & Governance

Every claim is traceable.
Every document is hashed.
Every alert is justified.

This is not commentary.

It is executable intelligence.

---

# 🧠 I. Intelligence Acquisition Layer

The platform continuously monitors 18 public sources across Tier 1–4 classifications.

### Capabilities

- Source Registry & Tiered Credibility Model
- Conditional Fetching (ETag / Last-Modified)
- SHA-256 Deduplication
- robots.txt Enforcement
- Denial Logging to audit_log

This layer ensures:

- Legal compliance
- Conditional network efficiency
- Chain-of-custody integrity

```
config/sources.yaml  (18 public sources, Tiers 1–4)
          │
          ▼
┌────────────────────┐   ETag / Last-Modified
│   Collector        │ ◄─────────────────────── source_cache
│   Node/TypeScript  │
│   axios-retry      │
│   + robots.txt     │
└────────────────────┘
          │  SHA-256 hash + raw + clean text
          ▼
    PostgreSQL 16 / pgvector
```

---

# 🔎 II. Structured Extraction & Signal Modeling

Documents are processed through a Python 3.12 NLP pipeline.

### Extraction Components

- Named Entity Recognition (spaCy)
- Event Classification Engine
- Atomic Claim Detection
- Numerical Signal Extraction (USD, MW, Tons, KM)
- Sentence-Transformer Embeddings (vector(384))

All claims are stored in PostgreSQL 16 + pgvector.

Every extracted claim is linked to:

- `document.id`
- source URL
- tier classification
- composite score

---

# 📊 III. Composite Scoring Model

Each claim is scored across five weighted dimensions:

```
Score =
  (0.30 × Credibility)
+ (0.25 × Materiality)
+ (0.15 × Recency)
+ (0.20 × Opportunity)
− (0.10 × Risk)
```

| Dimension   | Weight | Driver                     |
| ----------- | ------ | -------------------------- |
| Credibility | 30%    | Tier × corroboration       |
| Materiality | 25%    | USD + strategic density    |
| Recency     | 15%    | Freshness decay            |
| Opportunity | 20%    | Expansion / tender signals |
| Risk        | −10%   | Friction penalties         |

Claims ≥ 0.65 are promoted to the alert pipeline.

---

# 🟢 IV. Infrastructure Convergence Domains

DICS monitors cross-sector acceleration across:

### 🟡 Mining

Concessions · Rare earth claims · Beneficiation signals

### 🟢 Energy

Solar buildouts · BESS installations · Grid expansions

### 🔵 Connectivity

Submarine cable landings · Data centers · Telecom spectrum

### 🟠 Logistics

Port expansion · Air cargo growth · Free zone activity

### 🟣 Capital

DFI financing · Project finance stack · SPV structuring

---

# 🔴 V. Risk & Regulatory Intelligence

A five-dimensional risk radar tracks:

| Risk Category | Low | Medium | High | Primary Mitigation                        |
| ------------- | --- | ------ | ---- | ----------------------------------------- |
| Political     | 🟢  | 🟡     | 🔴   | DFI co-finance + political risk insurance |
| Regulatory    | 🟢  | 🟡     | 🔴   | Local counsel + compliance buffer period  |
| ESG           | 🟢  | 🟡     | 🔴   | Independent environmental audit           |
| FX Exposure   | 🟢  | 🟡     | 🔴   | USD-denominated contract structures       |
| Execution     | 🟢  | 🟡     | 🔴   | EPC guarantees + milestone escrow         |

Mitigation pathways are embedded in the capital modeling layer.

---

# ⚫ VI. Governance & Audit Integrity

DICS enforces:

- Append-only `audit_log`
- Append-only `proof_registry`
- SHA-256 document hashing
- Blockchain-ready anchoring
- Source traceability on every claim

No UPDATE or DELETE allowed at the database rule level.

Institutional integrity is enforced at schema level.

---

# 🧠 VII. Agentic RAG Intelligence Layer

```
User Query
    │
    ▼
Embedding Model (all-MiniLM-L6-v2)
    │
    ▼
pgvector cosine similarity search
    │
    ▼
Top 10 relevant claims
    │ filtered: credibility ≥ 0.70
    ▼
Response with claim_id + document_id citations
```

Anti-hallucination policy:
If evidence is insufficient, DICS explicitly states missing evidence types.

---

# 🔗 VIII. Blockchain Anchoring

Every promoted intelligence report can be cryptographically anchored.

| Column          | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `document_hash` | SHA-256 of clean content                           |
| `chain_id`      | Target chain: polygon · ethereum · xrpl · private  |
| `chain_tx_hash` | On-chain transaction reference                     |
| `block_number`  | Immutable block reference                          |
| `anchored_at`   | Timestamp of on-chain confirmation                 |

```
Document → SHA-256 Hash → proof_registry → Web3 Anchor → On-chain Tx Reference
```

Table is append-only — UPDATE and DELETE are blocked at the database rule level.

---

# 📊 IX. Observability & Metrics

Prometheus endpoint:

```
GET :9091/metrics
```

| Metric                       | Description                   |
| ---------------------------- | ----------------------------- |
| `collector_fetch_total`      | All fetch attempts            |
| `collector_fetch_ok`         | Successful (2xx/3xx) fetches  |
| `collector_fetch_fail`       | Network or server errors      |
| `collector_robots_denied`    | URLs blocked by robots.txt    |
| `collector_dedupe_skipped`   | Duplicate content skipped     |
| `collector_documents_saved`  | New documents persisted       |
| `extractor_claims_generated` | Claims extracted and scored   |
| `alerts_sent`                | Cloudflare webhook dispatches |

Health check:

```
GET :9091/health → { "status": "ok", "ts": "…" }
```

---

# 🧭 X. Operational Philosophy

DICS does not speculate.

It does not scrape behind authentication.

It does not bypass paywalls.

It operates strictly within:

- Public-source intelligence boundaries
- robots.txt compliance
- Append-only governance
- Structured, traceable scoring

The output is defensible.

---

# 📋 XI. Source Tiers

| Tier | Type                           | Confidence | Examples                             |
| ---- | ------------------------------ | ---------- | ------------------------------------ |
| 1    | Official government/regulators | 1.0        | MEM, INDOTEL, APORDOM, Banco Central |
| 2    | Multilateral & data agencies   | 0.9        | World Bank, IDB, USGS, ITU          |
| 3    | Industry trade publications    | 0.7        | DatacenterDynamics, PV Magazine, JOC |
| 4    | Corporate press rooms          | 0.6        | Google Blog, Amazon Newsroom, AES    |
| 5    | Community / social signals     | 0.4        | Chambers, verified accounts          |

All 18 configured sources are in [`config/sources.yaml`](config/sources.yaml).

---

# 🌎 XII. Demographic Intelligence Overlay

Province-level operational context derived from World Bank, IDB, and ONE.

| Province             | Population | Workforce | Primary Sector    | Infra Readiness | Risk Score |
| -------------------- | ---------- | --------- | ----------------- | --------------- | ---------- |
| Santo Domingo        | High       | High      | Services / Trade  | Advanced        | Medium     |
| Santiago             | High       | Medium    | Manufacturing     | Growing         | Low        |
| La Altagracia        | Medium     | Medium    | Tourism           | High            | Medium     |
| San Pedro de Macorís | Medium     | Medium    | Free Zones        | Established     | Low        |
| Pedernales           | Low        | Low       | Mining (emerging) | Developing      | High       |
| Monseñor Nouel       | Low        | Low       | Mining / Forestry | Underdeveloped  | High       |

---

# ⚙️ XIII. Quick Start

### Prerequisites

- Docker Desktop (Postgres + Redis)
- Node.js 20+
- Python 3.12+

### 1. Environment

```bash
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD at minimum
```

### 2. Infrastructure

```bash
docker compose up postgres redis -d
```

### 3. Collector (dev mode)

```bash
cd collector
npm install
npm run dev          # metrics at http://localhost:9091/metrics
```

### 4. Extractor (dev mode)

```bash
cd extractor
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd src && python main.py
```

### 5. Full stack via Docker

```bash
docker compose up --build
```

### 6. Alert Worker

```bash
cd alerts
npm install
wrangler secret put WEBHOOK_SECRET
wrangler secret put SLACK_WEBHOOK_URL
npm run deploy
```

---

# 🗂️ XIV. Repository Structure

```
├── .github/
│   ├── copilot-instructions.md
│   └── workflows/deploy.yml       GitHub Actions → Netlify CI/CD
├── alerts/                         Cloudflare Worker — HMAC webhook → Slack
│   ├── src/index.ts
│   ├── package.json
│   └── wrangler.toml
├── collector/                      Node 20 / TypeScript fetch pipeline
│   ├── src/
│   │   ├── index.ts                Entrypoint — scheduler + metrics server
│   │   ├── lib/
│   │   │   ├── logger.ts           Structured pino logging
│   │   │   └── metrics.ts          Prometheus /metrics endpoint
│   │   ├── scheduler/              CronJob + p-queue orchestration
│   │   ├── fetcher/                axios-retry + robots.txt guard
│   │   ├── normalizer/             @mozilla/readability HTML → clean text
│   │   ├── deduper/                SHA-256 duplicate detection
│   │   ├── storage/                PostgreSQL persistence + audit log
│   │   └── config/                 sources.yaml loader
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── dashboard/                      Next.js 14 live intelligence console
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            Executive overview dashboard
│   │   │   ├── layout.tsx          Dark theme + sidebar navigation
│   │   │   └── api/                8 serverless API routes
│   │   ├── components/             8 intelligence components
│   │   └── lib/
│   │       ├── db.ts               Serverless-safe PostgreSQL pool
│   │       └── types.ts            13 TypeScript interfaces
│   ├── netlify.toml
│   ├── package.json
│   └── tsconfig.json
├── extractor/                      Python 3.12 NLP pipeline
│   ├── src/
│   │   ├── main.py                 Poll loop + orchestration
│   │   ├── ner/extractor.py        spaCy entity/event/claim extraction
│   │   ├── scoring/scorer.py       5-dimension claim scoring
│   │   ├── embeddings/embedder.py  sentence-transformers → pgvector
│   │   └── storage/db.py           psycopg2 + pgvector persistence
│   ├── Dockerfile
│   └── requirements.txt
├── shared/
│   ├── db/001_init.sql             Full schema + pgvector + proof_registry
│   └── schemas/                    8 JSON Schema definitions
├── config/
│   └── sources.yaml                18 monitored sources, Tier 1–4
├── docker-compose.yml              pgvector/pg16 + Redis 7 + services
├── .env.example
└── README.md
```

---

# 📐 XV. Data Model

| Table            | Purpose                                                         |
| ---------------- | --------------------------------------------------------------- |
| `documents`      | Raw + clean text, SHA-256 hash, dedup key, tier, tags           |
| `entities`       | Named entities: ORG, GPE, PERSON, ASSET, PERMIT, AGENCY        |
| `events`         | Typed events: ConcessionAward, TenderRelease, CapexAnnouncement |
| `claims`         | Scored atomic statements with `vector(384)` embeddings          |
| `relationships`  | Entity graph edges with typed relations                         |
| `audit_log`      | Append-only event log — UPDATE/DELETE blocked at DB level       |
| `source_cache`   | ETag / Last-Modified per source for conditional GETs            |
| `proof_registry` | Blockchain anchoring registry — append-only                     |

### Entity Graph

```
[Government Agency]
        │ issues
        ▼
[Concession Permit]
        │ enables
        ▼
[Mining Project] ◄──── finances ──── [DFI / Infra Fund]
        │
        │ secured by
        ▼
[SPV Vehicle]
        │ generates
        ▼
[Revenue Streams]
```

Relationship types: `finances · owns · operates · regulates · partners_with · awards_to`

---

# 🏛 XVI. System Architecture

```
config/sources.yaml
       │
       ▼
┌─────────────────┐     raw docs      ┌──────────────────┐
│   Collector     │ ──────────────►  │   PostgreSQL 16  │
│  Node/TypeScript│                  │  + pgvector      │
│  • Scheduler    │ ◄── ETag cache ─  │  • documents     │
│  • Fetcher      │                  │  • entities      │
│  • Normalizer   │                  │  • events        │
│  • Deduper      │                  │  • claims        │
└─────────────────┘                  │  • relationships │
                                     │  • audit_log     │
┌─────────────────┐     extracts to  │  • proof_registry│
│   Extractor     │ ──────────────►  │                  │
│  Python 3.12    │                  │  (pgvector for   │
│  • spaCy NER    │                  │   RAG retrieval) │
│  • Scorer       │                  └──────────────────┘
│  • Embedder     │
└─────────────────┘          ┌───────────────────────┐
         │                   │  Cloudflare Worker    │
         └── high score ───► │  Alert Webhook        │
                             │  → Slack notification │
                             └───────────────────────┘

┌─────────────────┐
│   Dashboard     │ ◄──── PostgreSQL queries
│  Next.js 14     │
│  • 8 API routes │
│  • 8 components │
│  • Convergence  │
│  • Trend Engine │
└─────────────────┘
         │
         ▼
  https://dics-dr-intelligence.netlify.app
```

---

# ⚖️ XVII. Legal & Operational Policy

- Only public sources are fetched — no paywall bypass, no login bypass, no CAPTCHA circumvention
- `robots.txt` is respected on every run; denials are recorded in `audit_log`
- Every claim traces to a `document.id` + source URL
- `audit_log` and `proof_registry` are append-only at the database rule level
- SHA-256 content hash is stored on every document for chain-of-custody
- High-impact claims require corroboration ≥ 2 sources before alert dispatch

---

# 🏛 Closing Statement

DICS is designed to support:

- Institutional capital committees
- Infrastructure allocators
- Strategic advisory firms
- Sovereign development analysis

It transforms fragmented public signals into structured, capital-grade intelligence.

---

**Live Dashboard:** [dics-dr-intelligence.netlify.app](https://dics-dr-intelligence.netlify.app)

**Repository:** [github.com/FTHTrading/DR](https://github.com/FTHTrading/DR)
