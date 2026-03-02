# DICS — DR Intelligence Command System

### Sovereign Infrastructure Intelligence Platform

Public-source, compliance-first intelligence pipeline for the Dominican Republic
infrastructure convergence: **rare earths · connectivity · energy · logistics · telecom**.

Tiers: `official=1.0` · `multilateral=0.9` · `trade=0.7` · `corporate=0.6` · `community=0.4`

---

## Color-Code Domain Legend

| Color | Domain |
|---|---|
| 🟡 Gold | Mining & Resource Intelligence |
| 🟢 Green | Energy Infrastructure |
| 🔵 Blue | Connectivity & Telecom |
| 🟠 Orange | Logistics & Trade |
| 🟣 Purple | Capital Structuring |
| 🔴 Red | Risk & Compliance |
| ⚫ Black | Governance & Audit |
| 🧠 Teal | AI & Agentic RAG |

---

## Table of Contents

### 🧠 I. Intelligence Acquisition Layer
1.1 [Source Registry & Tiering Model](#source-tiers)
1.2 [Collector Engine — Node/TypeScript](#collector)
1.3 [Conditional Fetching — ETag / Last-Modified](#conditional-fetching)
1.4 [SHA-256 Deduplication & Chain-of-Custody](#deduplication)
1.5 [robots.txt Compliance & Denial Logging](#compliance)

### 🔎 II. Extraction & Structured Intelligence Layer
2.1 [Named Entity Recognition — spaCy NER](#extraction)
2.2 [Event Classification Engine](#extraction)
2.3 [Atomic Claim Detection](#extraction)
2.4 [Numerical Signal Extraction — USD / MW / Tons / km](#extraction)
2.5 [Embedding Generation — pgvector RAG Layer](#rag)

### 📊 III. Scoring & Signal Prioritization
3.1 [Credibility Engine — Tier + Corroboration](#scoring-model)
3.2 [Materiality Weighting Model](#scoring-model)
3.3 [Recency Decay Function](#scoring-model)
3.4 [Opportunity Signal Detection](#scoring-model)
3.5 [Risk Penalty Model](#scoring-model)
3.6 [Composite Score Thresholding](#scoring-model)

### 🟢 IV. Infrastructure Convergence Intelligence
4.1 Energy Layer Monitoring
4.2 Mining & Rare Earth Tracking
4.3 Logistics Corridor Expansion
4.4 Telecom & Connectivity Upgrades
4.5 Free Zone & Industrial Mapping

### 🟣 V. Capital & Deal Structuring Layer
5.1 SPV Architecture Templates
5.2 Project Finance Stack Modeling
5.3 Revenue Simulation & IRR Sensitivity
5.4 Tender & Expansion Monetization Mapping
5.5 DFI / Multilateral Capital Signals

### 🔴 VI. Risk & Regulatory Engine
6.1 [Political Risk Heatmap](#risk-matrix)
6.2 Resource Nationalism Watch
6.3 Environmental Permitting Signals
6.4 FX & Sovereign Exposure
6.5 [Compliance Gatekeeper Protocol](#compliance)

### ⚫ VII. Governance & Audit Framework
7.1 [Immutable Audit Log](#governance)
7.2 [Document Hash Storage](#governance)
7.3 [Provenance Enforcement](#governance)
7.4 Publishing Controls
7.5 [Blockchain Anchoring — proof_registry](#blockchain-anchoring)

### 🔵 VIII. Alert & Notification Layer
8.1 [Composite Score Trigger Logic](#alerts)
8.2 Slack Webhook Dispatch
8.3 Event-Based Filtering
8.4 [Metrics & Observability — /metrics endpoint](#observability)

---

## System Flow Architecture

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
    ┌──────────────────────────────────────────────┐
    │  documents · entities · events · claims      │
    │  relationships · audit_log · proof_registry  │
    └──────────────────────────────────────────────┘
          │
          ▼
┌────────────────────┐
│   Extractor        │  ← polls unprocessed docs
│   Python 3.12      │
│   spaCy NER        │
│   sentence-xfmrs   │
└────────────────────┘
          │
          ▼
    Scored Claims (composite_score 0–1)
    embedding vector(384) → pgvector index
          │
          ▼
    composite_score ≥ 0.65 ?
          │ YES
          ▼
    Cloudflare Worker Webhook
          │
          ▼
    Slack Notification
```

---

## Entity Graph Architecture

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

Backed by the `relationships` table: `finances · owns · operates · regulates · partners_with · awards_to`

---

## RAG Architecture

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
Response with claim_id + doc_id citations
```

Anti-hallucination rule: every answer must cite at least one `claim.id` + `document.id`. If evidence is insufficient, the system explicitly surfaces missing evidence types.

---

## Scoring Model

$$
\text{Score} = (0.30 \times \text{Credibility}) + (0.25 \times \text{Materiality}) + (0.15 \times \text{Recency}) + (0.20 \times \text{Opportunity}) - (0.10 \times \text{Risk})
$$

| Dimension | Weight | Driver |
|---|---|---|
| Credibility | 30% | Source tier × corroboration count |
| Materiality | 25% | USD amount + strategic keyword density |
| Recency | 15% | Freshness decay from `fetched_at` |
| Opportunity | 20% | Tender / expansion / gap signal presence |
| Risk (penalty) | −10% | Delay / dispute / regulatory friction terms |

Claims with `composite_score ≥ 0.65` are promoted to the alert pipeline.

---

## Risk Matrix

| Risk Category | Low | Medium | High | Primary Mitigation |
|---|---|---|---|---|
| Political | 🟢 | 🟡 | 🔴 | DFI co-finance + political risk insurance |
| Regulatory | 🟢 | 🟡 | 🔴 | Local counsel + compliance buffer period |
| ESG | 🟢 | 🟡 | 🔴 | Independent environmental audit |
| FX Exposure | 🟢 | 🟡 | 🔴 | USD-denominated contract structures |
| Execution | 🟢 | 🟡 | 🔴 | EPC guarantees + milestone escrow |

---

## Demographic Intelligence Overlay

Province-level operational context derived from World Bank, IDB, and ONE (Oficina Nacional de Estadística) sources.

| Province | Population | Workforce | Primary Sector | Infra Readiness | Risk Score |
|---|---|---|---|---|---|
| Santo Domingo | High | High | Services / Trade | Advanced | Medium |
| Santiago | High | Medium | Manufacturing | Growing | Low |
| La Altagracia | Medium | Medium | Tourism | High | Medium |
| San Pedro de Macorís | Medium | Medium | Free Zones | Established | Low |
| Pedernales | Low | Low | Mining (emerging) | Developing | High |
| Monseñor Nouel | Low | Low | Mining / Forestry | Underdeveloped | High |

---

## Source Tiers

| Tier | Type | Base Credibility | Examples |
|---|---|---|---|
| 1 | Official government / regulators | 1.0 | MEM, INDOTEL, APORDOM, Banco Central |
| 2 | Multilateral & data agencies | 0.9 | World Bank, IDB, USGS, ITU |
| 3 | Industry trade publications | 0.7 | DatacenterDynamics, PV Magazine, JOC |
| 4 | Corporate press rooms | 0.6 | Google Blog, Amazon Newsroom, AES |
| 5 | Community / social signals | 0.4 | Chambers, verified accounts |

All 18 configured sources are in [config/sources.yaml](config/sources.yaml).

---

## Blockchain Anchoring

`proof_registry` table stores cryptographic anchoring data for every promoted report:

| Column | Purpose |
|---|---|
| `document_hash` | SHA-256 of clean content |
| `chain_id` | Target chain: `polygon` · `ethereum` · `xrpl` · `private` |
| `chain_tx_hash` | On-chain transaction reference |
| `block_number` | Immutable block reference |
| `anchored_at` | Timestamp of on-chain confirmation |

Anchoring flow:

```
Document stored → SHA-256 hash → proof_registry (pending)
                                        │
                                        ▼
                               Web3 anchor microservice
                                        │
                                        ▼
                               Smart contract / XRPL memo
                                        │
                                        ▼
                               proof_registry updated (tx_hash + block)
```

Table is append-only — UPDATE and DELETE are blocked at the database rule level.

---

## Observability

Prometheus-compatible metrics at `GET :9091/metrics`:

```
collector_fetch_total          — all fetch attempts
collector_fetch_ok             — successful (2xx/3xx) fetches
collector_fetch_fail           — network or server errors
collector_robots_denied        — URLs blocked by robots.txt
collector_dedupe_skipped       — duplicate content skipped
collector_documents_saved      — new documents persisted
extractor_claims_generated     — claims extracted and scored
alerts_sent                    — Cloudflare webhook dispatches
```

Health check at `GET :9091/health` → `{ status: "ok", ts: "…" }`.

---

## Governance

- `audit_log` is append-only — PostgreSQL rules block UPDATE and DELETE.
- `proof_registry` is append-only — same rule enforcement.
- Every `document.content_hash` is computed at fetch time (SHA-256 of `clean_text`).
- Every claim traces to a `document.id` + `source_url`.
- robots.txt denials are written to `audit_log` as `robots.denied` events proving compliance.

---

## Quick Start

### Prerequisites
- Docker Desktop — Postgres + Redis
- Node.js 20+
- Python 3.12+

### 1. Environment
```powershell
Copy-Item .env.example .env
# Edit .env — set POSTGRES_PASSWORD at minimum
```

### 2. Infrastructure
```powershell
docker compose up postgres redis -d
```

### 3. Collector
```powershell
cd collector
npm install
npm run dev          # metrics available at http://localhost:9091/metrics
```

### 4. Extractor
```powershell
cd extractor
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd src ; python main.py
```

### 5. Full stack via Docker
```powershell
docker compose up --build
```

### 6. Deploy alert Worker
```powershell
cd alerts
npm install
wrangler secret put WEBHOOK_SECRET
wrangler secret put SLACK_WEBHOOK_URL
npm run deploy
```

---

## Repository Structure

```
├── .github/
│   └── copilot-instructions.md
├── alerts/                         Cloudflare Worker — HMAC webhook → Slack
│   ├── src/index.ts
│   ├── package.json
│   └── wrangler.toml
├── collector/                      Node 20 / TypeScript fetch pipeline
│   ├── src/
│   │   ├── index.ts                Entrypoint — scheduler + metrics server
│   │   ├── lib/
│   │   │   ├── logger.ts           Structured pino logging
│   │   │   └── metrics.ts          Prometheus-compatible /metrics endpoint
│   │   ├── scheduler/              CronJob + p-queue orchestration
│   │   ├── fetcher/                axios-retry + robots.txt guard
│   │   ├── normalizer/             @mozilla/readability HTML → clean text
│   │   ├── deduper/                SHA-256 duplicate detection
│   │   ├── storage/                PostgreSQL persistence + audit log
│   │   └── config/                 sources.yaml loader
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── extractor/                      Python 3.12 NLP pipeline
│   ├── src/
│   │   ├── main.py                 Poll loop + orchestration
│   │   ├── ner/extractor.py        spaCy entity / event / claim extraction
│   │   ├── scoring/scorer.py       5-dimension claim scoring
│   │   ├── embeddings/embedder.py  sentence-transformers → pgvector
│   │   └── storage/db.py           psycopg2 + pgvector persistence
│   ├── Dockerfile
│   └── requirements.txt
├── shared/
│   ├── db/001_init.sql             Full schema: all tables + proof_registry
│   └── schemas/                    JSON Schema definitions (8 models)
├── config/
│   └── sources.yaml                18 configured sources, Tier 1–4
├── docker-compose.yml              pgvector/pg16 + Redis 7 + services
├── .env.example
└── README.md
```

---

## Data Model

| Table | Purpose |
|---|---|
| `documents` | Raw + clean text, SHA-256 hash, dedup key, tier, tags |
| `entities` | Named entities: ORG, GPE, PERSON, ASSET, PERMIT, AGENCY |
| `events` | Typed events: ConcessionAward, TenderRelease, CapexAnnouncement… |
| `claims` | Scored atomic statements with `vector(384)` embeddings |
| `relationships` | Entity graph edges with typed relations |
| `audit_log` | Append-only event log — UPDATE/DELETE blocked at DB level |
| `source_cache` | ETag / Last-Modified per source for conditional GETs |
| `proof_registry` | Blockchain anchoring registry — append-only |

---

## Legal & Operational Policy

- Only public sources are fetched — no paywall bypass, no login bypass, no CAPTCHA circumvention.
- `robots.txt` is respected on every run; denials are recorded in `audit_log`.
- Every claim traces to a `document.id` + source URL.
- `audit_log` and `proof_registry` are append-only at the database rule level.
- SHA-256 content hash is stored on every document for chain-of-custody.
- High-impact claims require corroboration ≥ 2 sources before alert dispatch.


## Architecture

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
┌─────────────────┐     extracts to  │                  │
│   Extractor     │ ──────────────►  │  (pgvector for   │
│  Python 3.12    │                  │   RAG retrieval) │
│  • spaCy NER    │                  └──────────────────┘
│  • Scorer       │
│  • Embedder     │          ┌───────────────────────┐
└─────────────────┘          │  Cloudflare Worker    │
         │                   │  Alert Webhook        │
         └── high score ───► │  → Slack notification │
                             └───────────────────────┘
```

## Quick Start

### 1. Prerequisites

- Docker Desktop (for Postgres + Redis)
- Node.js 20+
- Python 3.12+

### 2. Environment

```bash
cp .env.example .env
# Edit .env — set POSTGRES_PASSWORD at minimum
```

### 3. Start infrastructure

```bash
docker compose up postgres redis -d
```

### 4. Run the collector (dev mode)

```bash
cd collector
npm install
npm run dev
```

### 5. Run the extractor (dev mode)

```bash
cd extractor
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd src
python main.py
```

### 6. Run everything via Docker

```bash
docker compose up --build
```

### 7. Deploy the alert Worker

```bash
cd alerts
npm install
wrangler secret put WEBHOOK_SECRET
wrangler secret put SLACK_WEBHOOK_URL
npm run deploy
```

## Project Structure

```
├── .github/
│   └── copilot-instructions.md
├── alerts/                      Cloudflare Worker webhook
│   ├── src/index.ts
│   ├── package.json
│   └── wrangler.toml
├── collector/                   Node.js fetcher service
│   ├── src/
│   │   ├── index.ts
│   │   ├── scheduler/
│   │   ├── fetcher/             HTTP + robots.txt
│   │   ├── normalizer/          Readability extraction
│   │   ├── deduper/             SHA-256 dedup
│   │   ├── storage/             PG persistence
│   │   ├── config/              sources.yaml loader
│   │   └── lib/logger.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── extractor/                   Python NLP service
│   ├── src/
│   │   ├── main.py
│   │   ├── ner/extractor.py     spaCy entity/event/claim extraction
│   │   ├── scoring/scorer.py    Credibility + materiality scoring
│   │   ├── embeddings/embedder.py  sentence-transformers
│   │   └── storage/db.py        psycopg2 + pgvector
│   ├── Dockerfile
│   └── requirements.txt
├── shared/
│   ├── db/001_init.sql          PostgreSQL schema + pgvector
│   └── schemas/                 JSON Schema definitions
│       ├── source.json
│       ├── document.json
│       ├── entity.json
│       ├── event.json
│       ├── claim.json
│       ├── relationship.json
│       ├── scorecard.json
│       └── auditlog.json
├── config/
│   └── sources.yaml             19 monitored public sources (Tier 1–4)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Data Model

| Table | Purpose |
|---|---|
| `documents` | Raw + clean text, SHA-256 hash, dedup key |
| `entities` | Named entities (ORG, GPE, PERSON, ASSET…) |
| `events` | Detected event types (ConcessionAward, TenderRelease…) |
| `claims` | Scored atomic statements with embeddings |
| `relationships` | Entity graph edges |
| `audit_log` | Append-only, tamper-ruled immutable log |
| `source_cache` | ETag / Last-Modified per source for conditional GETs |

## Scoring Model

Each claim receives five sub-scores, combined into a composite:

| Dimension | Weight | Notes |
|---|---|---|
| Credibility | 30% | Source tier + corroboration count |
| Materiality | 25% | USD amount + strategic keywords |
| Recency | 15% | Freshness relative to now |
| Opportunity | 20% | Gap/tender/expansion signals |
| Risk (penalty) | −10% | Delay/dispute/regulatory friction |

Claims with `composite_score >= 0.65` trigger an alert webhook.

## Source Tiers

| Tier | Type | Confidence |
|---|---|---|
| 1 | Official government / regulators | 1.0 |
| 2 | Multilateral orgs / major data | 0.9 |
| 3 | Industry trade publications | 0.7 |
| 4 | Corporate press rooms | 0.6 |
| 5 | Community / social (low trust) | 0.4 |

## Legal & Operational Policy

- Only public sources are fetched — no paywall bypass, no login bypass, no CAPTCHA circumvention.
- `robots.txt` is respected on every run.
- Every claim traces back to a `Document.id` + source URL.
- `audit_log` is append-only (DB-level rules prevent UPDATE/DELETE).
- Content hash stored on every document for chain-of-custody.
