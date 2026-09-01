"""Portfolio Risk Agent: deterministic sector-exposure and suitability
analysis, personalized to a stored investor risk profile.

Input: symbol, profile ("conservative" | "aggressive"), investment_percentage
(proposed additional allocation, as a % of total portfolio value, default 14).
Output: dict following the shared agent-output contract, plus currentExposure,
projectedExposure and concentration. All numbers come from
data/portfolios.json and data/user_profiles.json via plain arithmetic --
no LLM-generated figures. Missing symbols/profiles return "unavailable"
values rather than fabricated ones.
"""

import json
import time
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[3]
_PORTFOLIOS_PATH = _REPO_ROOT / "data" / "portfolios.json"
_PROFILES_PATH = _REPO_ROOT / "data" / "user_profiles.json"


def _load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _agent_result(**overrides) -> dict:
    base = {
        "name": "Portfolio Risk Agent",
        "status": "completed",
        "signal": "NEUTRAL",
        "confidence": 0,
        "summary": "",
        "evidence": [],
        "source": "unavailable",
        "latency": 0,
        "currentExposure": "unavailable",
        "projectedExposure": "unavailable",
        "concentration": "unavailable",
    }
    base.update(overrides)
    return base


def _latency_ms(start: float) -> int:
    return int((time.perf_counter() - start) * 1000)


async def portfolio_agent(
    symbol: str, profile: str, investment_percentage: float = 14
) -> dict:
    start = time.perf_counter()

    if not symbol or not isinstance(symbol, str):
        return _agent_result(
            status="unavailable",
            summary="No symbol provided. Not financial advice.",
            latency=_latency_ms(start),
        )
    if not profile or not isinstance(profile, str):
        return _agent_result(
            status="unavailable",
            summary="No profile provided. Not financial advice.",
            latency=_latency_ms(start),
        )

    symbol_norm = symbol.strip().upper()
    profile_norm = profile.strip().lower()

    try:
        profiles = _load_json(_PROFILES_PATH)
    except (FileNotFoundError, json.JSONDecodeError):
        return _agent_result(
            status="unavailable",
            summary="User profile data unavailable. Not financial advice.",
            latency=_latency_ms(start),
        )

    if profile_norm not in profiles:
        return _agent_result(
            status="unavailable",
            summary=(
                f"Unknown profile '{profile}'. Supported profiles: "
                f"{', '.join(sorted(profiles))}. Not financial advice."
            ),
            latency=_latency_ms(start),
        )

    try:
        portfolio_data = _load_json(_PORTFOLIOS_PATH)
    except (FileNotFoundError, json.JSONDecodeError):
        return _agent_result(
            status="unavailable",
            summary="Portfolio data unavailable. Not financial advice.",
            latency=_latency_ms(start),
        )

    default_portfolio = portfolio_data.get("portfolios", {}).get("default", {})
    holdings = default_portfolio.get("holdings", [])
    total_value = default_portfolio.get("total_value", 0)

    target_holding = next(
        (h for h in holdings if h.get("symbol", "").upper() == symbol_norm), None
    )

    if target_holding is None or not total_value:
        return _agent_result(
            status="insufficient_data",
            summary=(
                f"No demo portfolio holding found for '{symbol_norm}'. Sector "
                "exposure is unavailable rather than estimated. Not financial advice."
            ),
            latency=_latency_ms(start),
        )

    sector = target_holding["sector"]
    sector_value = sum(h["value"] for h in holdings if h.get("sector") == sector)

    current_exposure = round((sector_value / total_value) * 100, 1)
    projected_exposure = round(current_exposure + investment_percentage, 1)

    limit = profiles[profile_norm]["max_sector_exposure"]
    max_volatility = profiles[profile_norm]["max_volatility"]
    holding_volatility = target_holding.get("volatility")

    concentration = "LOW" if projected_exposure <= limit else "HIGH"
    volatility_breach = holding_volatility is not None and holding_volatility > max_volatility

    warnings = []
    if concentration == "HIGH":
        warnings.append(
            f"Projected {sector} exposure of {projected_exposure}% exceeds the "
            f"{profile_norm} profile's {limit}% sector limit."
        )
    if volatility_breach:
        warnings.append(
            f"{symbol_norm} volatility ({holding_volatility}) exceeds the "
            f"{profile_norm} profile's volatility ceiling ({max_volatility})."
        )
    suitability_warning = (
        " ".join(warnings)
        if warnings
        else (
            f"Projected {sector} exposure of {projected_exposure}% remains within "
            f"the {profile_norm} profile's limits."
        )
    )

    signal = "BULLISH" if not warnings else "BEARISH"
    confidence = 90

    evidence = [
        f"Current {sector} exposure: {current_exposure}% of demo portfolio "
        "(Source: data/portfolios.json - DEMO holdings snapshot).",
        f"Proposed additional investment: {investment_percentage}% -> projected "
        f"{sector} exposure: {projected_exposure}%.",
        f"{profile_norm.capitalize()} profile sector limit: {limit}% "
        "(Source: data/user_profiles.json).",
        suitability_warning,
    ]

    summary = (
        f"A {investment_percentage}% additional allocation to {symbol_norm} would "
        f"bring {sector} exposure to {projected_exposure}% under the {profile_norm} "
        f"profile ({concentration.replace('_', ' ')}). Not financial advice."
    )

    return _agent_result(
        status="completed",
        signal=signal,
        confidence=confidence,
        summary=summary,
        evidence=evidence,
        source="data/portfolios.json; data/user_profiles.json (DEMO)",
        latency=_latency_ms(start),
        currentExposure=current_exposure,
        projectedExposure=projected_exposure,
        concentration=concentration,
    )
