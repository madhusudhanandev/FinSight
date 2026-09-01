"""
Synthesis — owned by Member 1 (backend/app/services/synthesis.py).

Combines the four agent outputs into one deterministic final result.
No LLM randomness here — pure rule-based weighting so the same inputs
always produce the same recommendation.
"""

from typing import List, Tuple, Optional

# Weights per spec: Technical 30%, Fundamental 35%, Sentiment 15%, Portfolio 20%
WEIGHTS = {
    "Technical Analysis Agent": 0.30,
    "Fundamental Agent": 0.35,
    "News Sentiment Agent": 0.15,
    "Portfolio Risk Agent": 0.20,
}

SIGNAL_SCORE = {
    "BULLISH": 1.0,
    "NEUTRAL": 0.0,
    "BEARISH": -1.0,
}

# Static demo company/price data.
# Real market data (price/change) is owned by Member 2 — replace this
# lookup once Member 2's market_data.json / market agent is merged.
COMPANY_INFO = {
    "TCS": {"company": "Tata Consultancy Services", "price": 3215.40, "change": 1.82},
    "RELIANCE": {"company": "Reliance Industries", "price": 2945.15, "change": -0.64},
    "INFY": {"company": "Infosys", "price": 1512.80, "change": 0.95},
}


def _weighted_score_and_confidence(
    agents: List[dict],
) -> Tuple[float, float, int, bool]:
    """Returns (weighted_score, weighted_confidence, data_completeness_pct,
    any_agent_unavailable)."""

    total_weight = sum(WEIGHTS.values())
    available_weight = 0.0
    score_sum = 0.0
    confidence_sum = 0.0
    any_unavailable = False

    for agent in agents:
        weight = WEIGHTS.get(agent["name"], 0.0)
        if agent["status"] != "completed" or agent["signal"] not in SIGNAL_SCORE:
            any_unavailable = True
            continue
        available_weight += weight
        score_sum += weight * SIGNAL_SCORE[agent["signal"]]
        confidence_sum += weight * agent["confidence"]

    if available_weight == 0:
        return 0.0, 0.0, 0, True

    weighted_score = score_sum / available_weight
    weighted_confidence = confidence_sum / available_weight
    data_completeness = round((available_weight / total_weight) * 100)

    return weighted_score, weighted_confidence, data_completeness, any_unavailable


def _agents_disagree(agents: List[dict]) -> bool:
    """True if Technical and Fundamental agents point in opposite
    directions (strong disagreement between the two heaviest-weighted
    agents)."""
    by_name = {a["name"]: a for a in agents}
    technical = by_name.get("Technical Analysis Agent")
    fundamental = by_name.get("Fundamental Agent")
    if not technical or not fundamental:
        return False
    if technical["signal"] not in SIGNAL_SCORE or fundamental["signal"] not in SIGNAL_SCORE:
        return False
    return (
        SIGNAL_SCORE[technical["signal"]] * SIGNAL_SCORE[fundamental["signal"]] < 0
    )


def _extract_portfolio_fields(agents: List[dict]) -> Tuple[float, float, str]:
    portfolio = next(
        (a for a in agents if a["name"] == "Portfolio Risk Agent"), None
    )
    if not portfolio or portfolio["status"] != "completed":
        return 0.0, 0.0, "UNKNOWN"
    return (
        portfolio.get("currentExposure", 0.0),
        portfolio.get("projectedExposure", 0.0),
        portfolio.get("concentration", "UNKNOWN"),
    )


def synthesize(symbol: str, profile: str, agents: List[dict]) -> dict:
    """Combine agent outputs into the final AnalyzeResponse-shaped dict
    (minus totalLatency, which the caller fills in)."""

    (
        weighted_score,
        weighted_confidence,
        data_completeness,
        any_unavailable,
    ) = _weighted_score_and_confidence(agents)

    current_exposure, projected_exposure, concentration = _extract_portfolio_fields(
        agents
    )

    confidence = weighted_confidence
    warning: Optional[str] = None

    if any_unavailable:
        confidence -= 15

    if _agents_disagree(agents):
        confidence -= 10
        warning = "Technical and fundamental signals disagree; treat the result with caution."

    if concentration == "HIGH":
        confidence -= 10
        warning = "Portfolio sector concentration exceeds the profile's limit."

    confidence = max(0, min(100, round(confidence)))

    if data_completeness < 50:
        recommendation = "INSUFFICIENT DATA"
    elif weighted_score >= 0.4 and concentration != "HIGH":
        recommendation = "CONSIDER"
    elif weighted_score >= 0.4 and concentration == "HIGH":
        recommendation = "WATCH"
    elif weighted_score >= 0.0:
        recommendation = "WATCH"
    else:
        recommendation = "AVOID"

    info = COMPANY_INFO.get(
        symbol, {"company": symbol, "price": 0.0, "change": 0.0}
    )

    summary_parts = []
    fundamental = next((a for a in agents if a["name"] == "Fundamental Agent"), None)
    if fundamental and fundamental["status"] == "completed":
        summary_parts.append(f"Fundamentals are {fundamental['signal'].lower()}")
    if concentration == "HIGH":
        summary_parts.append("portfolio concentration is high")
    elif concentration == "MODERATE":
        summary_parts.append("portfolio concentration is moderate")
    if any_unavailable:
        summary_parts.append("one data source was unavailable")

    summary = (
        ", ".join(summary_parts).capitalize() + "."
        if summary_parts
        else "Insufficient data to form a detailed summary."
    )

    return {
        "company": info["company"],
        "symbol": symbol,
        "price": info["price"],
        "change": info["change"],
        "recommendation": recommendation,
        "confidence": confidence,
        "summary": summary,
        "agents": agents,
        "currentExposure": current_exposure,
        "projectedExposure": projected_exposure,
        "concentration": concentration,
        "dataCompleteness": data_completeness,
        "warning": warning,
    }
