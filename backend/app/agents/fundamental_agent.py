"""Fundamental Agent: evidence-grounded fundamental analysis over the demo
financial document corpus.

Input: symbol (e.g. "TCS").
Output: dict following the shared agent-output contract (name, status,
signal, confidence, summary, evidence, source, latency). Every fact in
`evidence` carries a visible source + page citation traceable back to
retrieve_documents. No claim is made without a matching retrieved chunk --
if evidence is insufficient, status/summary say so explicitly instead of
inventing figures.
"""

import time

from app.services.retrieval import retrieve_documents

SUPPORTED_SYMBOLS = {"TCS", "RELIANCE", "INFY"}

_FUNDAMENTAL_QUERY = "revenue growth profit margin earnings order book outlook risk debt"

_POSITIVE_TERMS = {
    "growth", "increase", "increased", "profit", "margin", "expansion",
    "strong", "record", "robust", "reduction", "improved", "improvement",
    "beat", "guidance",
}
_NEGATIVE_TERMS = {
    "decline", "declined", "risk", "volatility", "headwind", "pressure",
    "concentration", "slowdown", "weak", "loss", "exposure",
}


def _agent_result(**overrides) -> dict:
    base = {
        "name": "Fundamental Agent",
        "status": "completed",
        "signal": "NEUTRAL",
        "confidence": 0,
        "summary": "",
        "evidence": [],
        "source": "unavailable",
        "latency": 0,
    }
    base.update(overrides)
    return base


def _latency_ms(start: float) -> int:
    return int((time.perf_counter() - start) * 1000)


def _score_sentiment(docs: list) -> tuple:
    pos = neg = 0
    for doc in docs:
        content = doc.get("content", "").lower()
        for term in _POSITIVE_TERMS:
            pos += content.count(term)
        for term in _NEGATIVE_TERMS:
            neg += content.count(term)
    return pos, neg


def _derive_signal(pos: int, neg: int) -> str:
    if pos > neg * 1.2:
        return "BULLISH"
    if neg > pos * 1.2:
        return "BEARISH"
    return "NEUTRAL"


async def fundamental_agent(symbol: str) -> dict:
    start = time.perf_counter()

    if not symbol or not isinstance(symbol, str):
        return _agent_result(
            status="error",
            summary="No symbol provided. Not financial advice.",
            latency=_latency_ms(start),
        )

    symbol_norm = symbol.strip().upper()

    if symbol_norm not in SUPPORTED_SYMBOLS:
        return _agent_result(
            status="error",
            summary=(
                f"Symbol '{symbol_norm}' is not covered by the demo financial "
                f"document corpus (supported: {', '.join(sorted(SUPPORTED_SYMBOLS))}). "
                "Insufficient data to make fundamental claims. Not financial advice."
            ),
            latency=_latency_ms(start),
        )

    docs = retrieve_documents(symbol_norm, _FUNDAMENTAL_QUERY)

    if not docs:
        return _agent_result(
            status="insufficient_data",
            summary=(
                f"No supporting demo documents were retrieved for {symbol_norm}. "
                "Insufficient evidence to make fundamental claims. Not financial advice."
            ),
            latency=_latency_ms(start),
        )

    evidence = [
        f"{doc['content']} (Source: {doc['source']}, Page: {doc['page']}, Date: {doc['date']})"
        for doc in docs
    ]

    pos_count, neg_count = _score_sentiment(docs)
    signal = _derive_signal(pos_count, neg_count)
    confidence = min(95, 55 + 5 * len(docs) + abs(pos_count - neg_count))

    sources = sorted({doc["source"] for doc in docs})
    extra_sources = f" and {len(sources) - 1} other source(s)" if len(sources) > 1 else ""
    summary = (
        f"{symbol_norm} fundamentals show a {signal.lower()} signal based on "
        f"{len(docs)} demo document chunk(s) from {sources[0]}{extra_sources}. "
        "All figures are drawn from the synthetic demo corpus, not live filings. "
        "Not financial advice."
    )

    return _agent_result(
        status="completed",
        signal=signal,
        confidence=confidence,
        summary=summary,
        evidence=evidence,
        source="; ".join(sources),
        latency=_latency_ms(start),
    )
