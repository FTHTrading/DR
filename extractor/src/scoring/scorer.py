"""
Credibility, materiality, recency, opportunity, and risk scoring for extracted claims.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from ner.extractor import Claim

# Source tier -> base credibility
TIER_CREDIBILITY: dict[int, float] = {
    1: 1.0,   # official government
    2: 0.9,   # multilateral / major press
    3: 0.7,   # industry trade
    4: 0.6,   # corporate press rooms
    5: 0.4,   # community / social
}

# Keywords that raise materiality
HIGH_IMPACT_KEYWORDS = [
    "rare earth", "mine", "concession", "fiber", "cable", "data center",
    "solar", "battery", "bess", "grid", "port", "airport", "free zone",
    "frequency", "spectrum", "mvno", "pe fund", "project finance",
]

LARGE_AMOUNT_RE = re.compile(
    r"(\d[\d,\.]*)\s*(million|billion|M\b|B\b)", re.IGNORECASE
)


def _parse_usd(text: str | None) -> float | None:
    if not text:
        return None
    m = LARGE_AMOUNT_RE.search(text)
    if not m:
        return None
    amount = float(m.group(1).replace(",", ""))
    multiplier = 1_000_000 if m.group(2).lower() in ("million", "m") else 1_000_000_000
    return amount * multiplier


@dataclass
class ScoredClaim:
    claim: Claim
    credibility: float      # 0–1
    materiality: float      # 0–1
    recency: float          # 0–1 (1 = very fresh)
    opportunity: float      # 0–1
    risk: float             # 0–1 (higher = riskier)
    composite: float        # weighted aggregate
    usd_amount: float | None


class Scorer:
    def score(self, claim: Claim, source_tier: int = 3) -> ScoredClaim:
        credibility = TIER_CREDIBILITY.get(source_tier, 0.5)

        usd = _parse_usd(claim.what) or _parse_usd(claim.statement)
        materiality = self._materiality(claim, usd)
        recency = 1.0   # will be updated when doc timestamp is compared
        opportunity = self._opportunity(claim)
        risk = self._risk(claim)

        composite = (
            0.30 * credibility
            + 0.25 * materiality
            + 0.15 * recency
            + 0.20 * opportunity
            - 0.10 * risk
        )
        composite = max(0.0, min(1.0, composite))

        return ScoredClaim(
            claim=claim,
            credibility=credibility,
            materiality=materiality,
            recency=recency,
            opportunity=opportunity,
            risk=risk,
            composite=composite,
            usd_amount=usd,
        )

    def _materiality(self, claim: Claim, usd: float | None) -> float:
        score = 0.3
        text = (claim.statement or "").lower()
        if usd and usd >= 100_000_000:
            score += 0.4
        elif usd and usd >= 10_000_000:
            score += 0.2
        for kw in HIGH_IMPACT_KEYWORDS:
            if kw in text:
                score += 0.05
        return min(1.0, score)

    def _opportunity(self, claim: Claim) -> float:
        text = (claim.statement or "").lower()
        score = 0.3
        opportunity_kws = ["tender", "rfp", "open", "awarded", "expansion", "new", "investment"]
        for kw in opportunity_kws:
            if kw in text:
                score += 0.1
        return min(1.0, score)

    def _risk(self, claim: Claim) -> float:
        text = (claim.statement or "").lower()
        score = 0.2
        risk_kws = ["delay", "cancelled", "disputed", "risk", "opposition", "environmental", "legal"]
        for kw in risk_kws:
            if kw in text:
                score += 0.1
        return min(1.0, score)
