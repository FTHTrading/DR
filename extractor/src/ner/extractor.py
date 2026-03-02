"""
NER-based entity, event, and claim extractor using spaCy.
"""

from __future__ import annotations

import re
import uuid
from dataclasses import dataclass, field
from typing import Any

import spacy
from spacy.language import Language
import structlog

log = structlog.get_logger()

SPACY_MODEL = "en_core_web_sm"


@dataclass
class Entity:
    id: str
    doc_id: str
    type: str       # PERSON | ORG | GPE | MONEY | QUANTITY | DATE | ASSET | PERMIT
    text: str
    normalized: str
    start_char: int
    end_char: int
    confidence: float = 1.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class Event:
    id: str
    doc_id: str
    type: str       # ConcessionAward | TenderRelease | CapexAnnouncement | ...
    description: str
    entities: list[str]   # entity IDs
    raw_text: str
    confidence: float = 1.0


@dataclass
class Claim:
    id: str
    doc_id: str
    statement: str
    quantity: float | None
    unit: str | None
    who: str | None       # entity text
    what: str | None
    where: str | None
    when: str | None
    excerpt: str
    confidence: float = 0.5
    scores: dict[str, float] = field(default_factory=dict)


# Patterns mapped to event types
EVENT_PATTERNS: list[tuple[str, str]] = [
    (r"\bconcession\s+award", "ConcessionAward"),
    (r"\btender\s+(release|notice|issued)", "TenderRelease"),
    (r"\b(capex|capital expenditure|invest(?:ment)?)\s+of\s+\$", "CapexAnnouncement"),
    (r"\bmemorandum of understanding|MoU\b", "Partnership"),
    (r"\bfinancing\s+(signed|closed|round)", "Financing"),
    (r"\bregulat(?:ory|ion)\s+change", "RegulatoryChange"),
    (r"\bconstruction\s+(began|started|completed)", "ConstructionMilestone"),
    (r"\b(launch|operational|inaugurated)\b", "OperationalLaunch"),
    (r"\b(rare earth|mineral|deposit)\s+discover", "DiscoveryClaim"),
]

MONEY_RE = re.compile(r"\$\s?[\d,]+(?:\.\d+)?\s?(?:million|billion|M|B)?", re.IGNORECASE)
QUANTITY_RE = re.compile(r"[\d,]+(?:\.\d+)?\s?(?:MW|GW|km|ton(?:ne)?s?|MT|acres|ha)\b", re.IGNORECASE)


def _normalize(text: str) -> str:
    return " ".join(text.lower().split())


class EntityExtractor:
    def __init__(self) -> None:
        try:
            self._nlp: Language = spacy.load(SPACY_MODEL)
        except OSError:
            log.warning("spacy_model_not_found", model=SPACY_MODEL, fallback="en_core_web_sm")
            self._nlp = spacy.load("en_core_web_sm")

    def extract(
        self, text: str, doc_id: str
    ) -> tuple[list[Entity], list[Event], list[Claim]]:
        doc = self._nlp(text[:100_000])  # guard against huge documents

        entities = self._extract_entities(doc, doc_id)
        events = self._detect_events(text, doc_id, entities)
        claims = self._build_claims(text, doc_id, entities)

        return entities, events, claims

    def _extract_entities(self, doc: Any, doc_id: str) -> list[Entity]:
        seen: set[str] = set()
        entities: list[Entity] = []

        for ent in doc.ents:
            key = f"{ent.label_}::{_normalize(ent.text)}"
            if key in seen:
                continue
            seen.add(key)
            entities.append(
                Entity(
                    id=str(uuid.uuid4()),
                    doc_id=doc_id,
                    type=ent.label_,
                    text=ent.text,
                    normalized=_normalize(ent.text),
                    start_char=ent.start_char,
                    end_char=ent.end_char,
                )
            )

        return entities

    def _detect_events(self, text: str, doc_id: str, entities: list[Entity]) -> list[Event]:
        events: list[Event] = []
        entity_ids = [e.id for e in entities]

        for pattern, event_type in EVENT_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                start = max(0, match.start() - 120)
                end = min(len(text), match.end() + 120)
                snippet = text[start:end].strip()
                events.append(
                    Event(
                        id=str(uuid.uuid4()),
                        doc_id=doc_id,
                        type=event_type,
                        description=snippet[:200],
                        entities=entity_ids[:5],
                        raw_text=snippet,
                    )
                )

        return events

    def _build_claims(self, text: str, doc_id: str, entities: list[Entity]) -> list[Claim]:
        claims: list[Claim] = []

        # One claim per money/quantity mention with surrounding context
        for match in list(MONEY_RE.finditer(text)) + list(QUANTITY_RE.finditer(text)):
            start = max(0, match.start() - 200)
            end = min(len(text), match.end() + 200)
            excerpt = text[start:end].strip()

            orgs = [e.text for e in entities if e.type == "ORG"]
            gpes = [e.text for e in entities if e.type == "GPE"]
            dates = [e.text for e in entities if e.type == "DATE"]

            claims.append(
                Claim(
                    id=str(uuid.uuid4()),
                    doc_id=doc_id,
                    statement=excerpt[:300],
                    quantity=None,   # parsed downstream in scorer
                    unit=None,
                    who=orgs[0] if orgs else None,
                    what=match.group(0),
                    where=gpes[0] if gpes else None,
                    when=dates[0] if dates else None,
                    excerpt=excerpt[:500],
                )
            )

        return claims
