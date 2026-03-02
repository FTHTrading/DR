"""
Sector and location normalization for claims.

Deterministic mapping — no free text. Every claim gets:
  - sector_normalized:   one of SECTORS
  - location_normalized: one of LOCATIONS
  - capital_intensity:   modifier based on claim content type
"""

from __future__ import annotations

import re

# ── Canonical sectors ──────────────────────────────────────────────────────────
SECTORS = {"energy", "mining", "telecom", "logistics", "finance", "tourism", "macro"}

SECTOR_KEYWORDS: dict[str, list[str]] = {
    "energy": [
        "solar", "photovoltaic", "pv ", "bess", "battery", "grid", "mw ", "mwh",
        "generation", "concession", "wind", "renewable", "electricity", "kwh",
        "substation", "interconnection", "eted", "cne", "sie", "egehaina",
        "aes ", "lng", "natural gas", "fuel", "power plant", "capacity",
        "frequency regulation", "peak shifting", "curtailment", "dispatch",
    ],
    "mining": [
        "rare earth", "ree", "mining", "mineral", "geological", "dgm",
        "deposit", "treo", "ore", "cerium", "lanthanum", "neodymium",
        "drill", "survey", "geophysical", "usgs", "cordillera",
    ],
    "telecom": [
        "5g", "fiber", "cable", "submarine", "data center", "spectrum",
        "indotel", "altice", "claro", "mvno", "broadband", "connectivity",
        "digital", "telecom", "bandwidth", "latency", "edge computing",
    ],
    "logistics": [
        "port", "caucedo", "airport", "free zone", "logistics", "cargo",
        "container", "teu", "warehouse", "berth", "ship", "maritime",
        "road", "highway", "mopc", "apordom", "dp world", "bonded",
    ],
    "finance": [
        "fdi", "investment", "bond", "credit", "loan", "gdp", "inflation",
        "central bank", "bancentral", "peso", "usd", "CapEx", "financing",
        "debt", "equity", "dfi", "idb", "world bank", "ifc", "miga",
    ],
    "tourism": [
        "tourism", "hotel", "resort", "ecotourism", "confotur", "visitor",
        "hospitality", "villa", "beach", "destination", "travel",
        "masterplan", "mixed-use", "mixed use", "real estate",
    ],
    "macro": [
        "government", "president", "congress", "law", "decree", "reform",
        "regulation", "policy", "national", "sovereign", "esg",
    ],
}

# ── Canonical locations ────────────────────────────────────────────────────────
LOCATIONS = {"bani", "cabrera", "pedernales", "santo_domingo", "samana", "national"}

LOCATION_KEYWORDS: dict[str, list[str]] = {
    "bani": ["baní", "bani", "peravia"],
    "cabrera": ["cabrera", "maría trinidad", "maria trinidad"],
    "pedernales": ["pedernales"],
    "santo_domingo": [
        "santo domingo", "distrito nacional", "capital", "ozama",
    ],
    "samana": ["samaná", "samana", "las terrenas"],
    "national": [
        "dominican republic", "república dominicana", "nationwide",
        "country-wide", "national",
    ],
}

# ── Capital intensity modifiers ────────────────────────────────────────────────
CAPITAL_PATTERNS: list[tuple[str, float]] = [
    (r"\bppa\b|power purchase agreement", 1.3),
    (r"\bgrid\s+(?:interconnection|approval|upgrade)", 1.2),
    (r"\bconcession\b", 1.2),
    (r"\bconstruction\s+(?:began|started|completed)", 1.15),
    (r"\bfinancing\s+(?:signed|closed|approved)", 1.25),
    (r"\brfp\b|\btender\b", 1.1),
    (r"\b(?:fdi|foreign direct investment)\b", 1.1),
    (r"\bgreen bond\b|\bsll\b|\bsustainability", 1.15),
    (r"\b(?:carbon|emission|co2)\b", 1.1),
    (r"\b(?:article|reported|according to|sources say)\b", 0.5),
    (r"\b(?:press release|announcement|newsletter)\b", 0.6),
]


def normalize_sector(text: str) -> str:
    """Return the best-match sector for claim text. Defaults to 'macro'."""
    text_lower = text.lower()
    scores: dict[str, int] = {s: 0 for s in SECTORS}

    for sector, keywords in SECTOR_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[sector] += 1

    best = max(scores, key=scores.get)  # type: ignore[arg-type]
    return best if scores[best] > 0 else "macro"


def normalize_location(text: str) -> str:
    """Return the best-match location for claim text. Defaults to 'national'."""
    text_lower = text.lower()
    scores: dict[str, int] = {loc: 0 for loc in LOCATIONS}

    for location, keywords in LOCATION_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                scores[location] += 1

    best = max(scores, key=scores.get)  # type: ignore[arg-type]
    return best if scores[best] > 0 else "national"


def compute_capital_intensity(text: str) -> float:
    """Return capital intensity modifier based on claim content. Range ~0.5–1.3."""
    text_lower = text.lower()
    modifier = 0.8  # default baseline

    for pattern, weight in CAPITAL_PATTERNS:
        if re.search(pattern, text_lower):
            modifier = max(modifier, weight)

    return round(min(1.5, modifier), 2)
