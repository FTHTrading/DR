"""
DICS Extractor — main entry point.

Polls the documents table for unprocessed records, runs NLP extraction,
scores claims, generates embeddings, and persists results.
"""

from __future__ import annotations

import os
import time

import structlog
from dotenv import load_dotenv

from storage.db import Database
from ner.extractor import EntityExtractor
from scoring.scorer import Scorer
from embeddings.embedder import Embedder

load_dotenv()

log = structlog.get_logger()


def run_once(db: Database, extractor: EntityExtractor, scorer: Scorer, embedder: Embedder) -> int:
    """Process one batch of unprocessed documents. Returns number processed."""
    rows = db.fetch_unprocessed_documents(batch_size=20)
    if not rows:
        return 0

    for doc in rows:
        log.info("processing_document", doc_id=doc["id"], source_id=doc["source_id"])
        try:
            entities, events, claims = extractor.extract(doc["clean_text"], doc["id"])
            scored_claims = [scorer.score(c, doc["tier"]) for c in claims]
            embeddings = embedder.embed_claims(scored_claims)

            db.save_extraction_results(
                doc_id=doc["id"],
                entities=entities,
                events=events,
                claims=scored_claims,
                embeddings=embeddings,
            )
            db.mark_document_processed(doc["id"])
            log.info("document_processed", doc_id=doc["id"],
                     entities=len(entities), claims=len(scored_claims))
        except Exception:
            log.exception("extraction_failed", doc_id=doc["id"])
            db.mark_document_failed(doc["id"])

    # Recompute asset impact after each batch
    try:
        db.compute_asset_impact()
    except Exception:
        log.exception("asset_impact_computation_failed")

    return len(rows)


def main() -> None:
    poll_interval = int(os.getenv("EXTRACTOR_POLL_SECONDS", "30"))

    db = Database()
    extractor = EntityExtractor()
    scorer = Scorer()
    embedder = Embedder()

    log.info("dics_extractor_started", poll_interval=poll_interval)

    while True:
        processed = run_once(db, extractor, scorer, embedder)
        if processed == 0:
            log.debug("no_new_documents", sleeping=poll_interval)
        time.sleep(poll_interval)


if __name__ == "__main__":
    main()
