"""
PostgreSQL persistence for extracted entities, events, claims, and embeddings.
"""

from __future__ import annotations

import json
import os
from contextlib import contextmanager
from typing import Any, Generator

import psycopg2
import psycopg2.extras
from pgvector.psycopg2 import register_vector
import structlog

from ner.extractor import Entity, Event, Claim
from scoring.scorer import ScoredClaim

log = structlog.get_logger()


class Database:
    def __init__(self) -> None:
        self._dsn = os.environ["DATABASE_URL"]
        self._conn = psycopg2.connect(self._dsn)
        self._conn.autocommit = False
        register_vector(self._conn)
        log.info("extractor_db_connected")

    @contextmanager
    def _tx(self) -> Generator[psycopg2.extensions.cursor, None, None]:
        cur = self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        try:
            yield cur
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            raise
        finally:
            cur.close()

    # ------------------------------------------------------------------
    # Reads
    # ------------------------------------------------------------------
    def fetch_unprocessed_documents(self, batch_size: int = 20) -> list[dict[str, Any]]:
        """Fetch unprocessed docs without row locks (single-instance safe).
        For multi-instance, use advisory locks in the main loop instead."""
        with self._tx() as cur:
            cur.execute(
                """SELECT id, source_id, clean_text, tier
                   FROM documents
                   WHERE extracted_at IS NULL AND failed_at IS NULL
                   ORDER BY fetched_at ASC
                   LIMIT %s""",
                (batch_size,),
            )
            return [dict(r) for r in cur.fetchall()]

    # ------------------------------------------------------------------
    # Writes
    # ------------------------------------------------------------------
    def save_extraction_results(
        self,
        doc_id: str,
        entities: list[Entity],
        events: list[Event],
        claims: list[ScoredClaim],
        embeddings: list[list[float]],
    ) -> None:
        with self._tx() as cur:
            # Entities
            for ent in entities:
                cur.execute(
                    """INSERT INTO entities
                         (id, doc_id, type, text, normalized, start_char, end_char, confidence)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT DO NOTHING""",
                    (ent.id, doc_id, ent.type, ent.text, ent.normalized,
                     ent.start_char, ent.end_char, ent.confidence),
                )

            # Events
            for evt in events:
                cur.execute(
                    """INSERT INTO events
                         (id, doc_id, type, description, entity_ids, raw_text, confidence)
                       VALUES (%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT DO NOTHING""",
                    (evt.id, doc_id, evt.type, evt.description,
                     evt.entities, evt.raw_text, evt.confidence),
                )

            # Claims + embeddings
            for sc, emb in zip(claims, embeddings or [None] * len(claims)):
                c = sc.claim
                cur.execute(
                    """INSERT INTO claims
                         (id, doc_id, statement, quantity, unit, who, what, where_text,
                          when_text, excerpt, credibility, materiality, recency,
                          opportunity, risk, composite_score, usd_amount, embedding,
                          sector_normalized, location_normalized, capital_intensity)
                       VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                       ON CONFLICT DO NOTHING""",
                    (
                        c.id, doc_id, c.statement, c.quantity, c.unit,
                        c.who, c.what, c.where, c.when, c.excerpt,
                        sc.credibility, sc.materiality, sc.recency,
                        sc.opportunity, sc.risk, sc.composite, sc.usd_amount,
                        emb,
                        sc.sector_normalized, sc.location_normalized, sc.capital_intensity,
                    ),
                )

            # Audit log
            cur.execute(
                """INSERT INTO audit_log (event_type, entity_type, entity_id, payload, created_at)
                   VALUES ('extraction.completed','document',%s,%s,NOW())""",
                (doc_id, json.dumps({
                    "entities": len(entities),
                    "events": len(events),
                    "claims": len(claims),
                })),
            )

    def mark_document_processed(self, doc_id: str) -> None:
        with self._tx() as cur:
            cur.execute(
                "UPDATE documents SET extracted_at = NOW() WHERE id = %s", (doc_id,)
            )

    def mark_document_failed(self, doc_id: str) -> None:
        with self._tx() as cur:
            cur.execute(
                "UPDATE documents SET failed_at = NOW() WHERE id = %s", (doc_id,)
            )

    def compute_asset_impact(self) -> int:
        """Recompute asset_impact for all claims with sector_normalized set."""
        with self._tx() as cur:
            cur.execute("SELECT compute_asset_impact()")
            result = cur.fetchone()
            count = list(result.values())[0] if result else 0
            log.info("asset_impact_computed", rows=count)
            return count
