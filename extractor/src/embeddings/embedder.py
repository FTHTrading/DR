"""
Generates sentence embeddings for claims using sentence-transformers.
Embeddings are stored in pgvector for RAG retrieval.
"""

from __future__ import annotations

import os
from typing import Any

import structlog
from sentence_transformers import SentenceTransformer

from scoring.scorer import ScoredClaim

log = structlog.get_logger()

DEFAULT_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


class Embedder:
    def __init__(self) -> None:
        model_name = os.getenv("EMBEDDING_MODEL", DEFAULT_MODEL)
        log.info("loading_embedding_model", model=model_name)
        self._model = SentenceTransformer(model_name)

    def embed_claims(self, claims: list[ScoredClaim]) -> list[list[float]]:
        """Returns a list of embedding vectors, one per claim."""
        texts = [c.claim.excerpt or c.claim.statement for c in claims]
        if not texts:
            return []
        vectors = self._model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
        return [v.tolist() for v in vectors]

    def embed_text(self, text: str) -> list[float]:
        """Embed a single query string (used for RAG retrieval)."""
        vec = self._model.encode([text], normalize_embeddings=True)
        return vec[0].tolist()
