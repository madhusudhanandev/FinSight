"""
technical_agent.py
 
Purpose:
    Evaluates simulated market data for a single stock symbol (TCS, RELIANCE,
    or INFY) and produces a deterministic technical-analysis signal: price
    momentum vs. 20-day moving average, volume anomaly detection, and RSI
    overbought/oversold detection.
 
Inputs:
    symbol (str): One of "TCS", "RELIANCE", "INFY". Any other value is
        handled gracefully (no exception raised).
 
Outputs:
    dict matching the FinSight AI universal agent output contract (see
    MEM2_MARKET_AGENTS_RULES.md, Section 5):
        {
          "name": str,
          "status": "completed",
          "signal": "BULLISH" | "BEARISH" | "NEUTRAL",
          "confidence": int,   # 0-100, rule-derived (see _calculate_confidence)
          "summary": str,
          "evidence": list[str],
          "source": str,
          "latency": int       # milliseconds
        }
 
Owner: Member 2 (mem2) - Market Data & Technical Analysis Agent.
Do not modify the output contract shape without coordinating with the
orchestrator/synthesis owner (Member 3).
"""
 
import json
import time
from pathlib import Path
 
# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
 
AGENT_NAME = "Technical Analysis Agent"
DATA_SOURCE_LABEL = "Simulated Market Data"
 
VALID_SYMBOLS = {"TCS", "RELIANCE", "INFY"}
 
RSI_OVERBOUGHT_THRESHOLD = 70
RSI_OVERSOLD_THRESHOLD = 30
 
# Momentum is considered meaningful once price deviates from the 20D MA by
# at least this percentage (avoids flagging noise as a signal).
MOMENTUM_SIGNIFICANCE_PCT = 1.0
 
# Volume is considered anomalous outside this ratio band vs. the average.
VOLUME_SPIKE_RATIO = 1.5
VOLUME_DROP_RATIO = 0.5
 
# backend/app/agents/technical_agent.py -> parents[3] is the repo root
# (agents -> app -> backend -> <repo root>)
_REPO_ROOT = Path(__file__).resolve().parents[3]
MARKET_DATA_PATH = _REPO_ROOT / "data" / "market_data.json"
 
 
# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
 
def _load_market_data() -> dict:
    """Load the simulated market data file. Raises on hard I/O failure so the
    caller's try/except can convert it into a structured, non-crashing
    response."""
    with open(MARKET_DATA_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("symbols", {})
 
 
def _calculate_confidence(
    momentum_pct: float,
    momentum_score: int,
    rsi: float,
    rsi_score: int,
    volume_ratio: float,
    volume_anomaly: bool,
) -> int:
    """
    Deterministic, rule-based confidence score (0-100). No LLM involvement.
 
    Formula (documented per MEM2 rules Section 3.3):
        base                                   = 40
      + momentum strength, capped at 20 pts     = min(abs(momentum_pct) * 4, 20)
      + RSI extremity bonus                     = 20 if RSI is overbought/oversold else 0
      + volume anomaly bonus                    = 15 if volume ratio outside [0.5, 1.5] else 0
      + agreement bonus                         = 5 if momentum and RSI signals agree
                                                    in direction (both bullish or both
                                                    bearish) else 0
      -> clamped to [0, 100]
 
    This rewards signals that are (a) large in magnitude, (b) corroborated
    by an RSI extreme, (c) corroborated by unusual volume, and (d) internally
    consistent across indicators.
    """
    confidence = 40.0
    confidence += min(abs(momentum_pct) * 4, 20)
    if rsi_score != 0:
        confidence += 20
    if volume_anomaly:
        confidence += 15
    if momentum_score != 0 and rsi_score != 0 and (momentum_score == rsi_score):
        confidence += 5
 
    confidence = max(0.0, min(100.0, confidence))
    return int(round(confidence))
 
 
def _structured_error(symbol: str, message: str, start_time: float) -> dict:
    """Build a contract-shaped response for any failure path so an error in
    this agent can never crash the orchestration pipeline."""
    latency_ms = int(round((time.perf_counter() - start_time) * 1000))
    return {
        "name": AGENT_NAME,
        "status": "completed",
        "signal": "NEUTRAL",
        "confidence": 0,
        "summary": message,
        "evidence": [],
        "source": DATA_SOURCE_LABEL,
        "latency": latency_ms,
    }
 
 
# ---------------------------------------------------------------------------
# Public agent entrypoint
# ---------------------------------------------------------------------------
 
async def technical_agent(symbol: str) -> dict:
    """
    Evaluate momentum, volume anomaly, and RSI for `symbol` using the
    simulated dataset in data/market_data.json, and return a contract-shaped
    signal. Never raises.
    """
    start_time = time.perf_counter()
 
    try:
        # --- Symbol validation (Section 3.4) -------------------------------
        symbol = (symbol or "").strip().upper()
        if symbol not in VALID_SYMBOLS:
            return _structured_error(
                symbol,
                f"Symbol '{symbol or '(empty)'}' is not recognized. "
                f"Supported symbols: {', '.join(sorted(VALID_SYMBOLS))}.",
                start_time,
            )
 
        try:
            market_data = _load_market_data()
        except (OSError, json.JSONDecodeError) as exc:
            return _structured_error(
                symbol,
                f"Market data could not be loaded ({exc.__class__.__name__}). "
                "Technical signal unavailable for this run.",
                start_time,
            )
 
        entry = market_data.get(symbol)
        if not entry:
            return _structured_error(
                symbol,
                f"No simulated market data found for '{symbol}'.",
                start_time,
            )
 
        # --- Pull required fields, defaulting missing ones to "unavailable" -
        price = entry.get("price")
        ma20 = entry.get("moving_average_20d")
        current_volume = entry.get("current_volume")
        average_volume = entry.get("average_volume")
        rsi = entry.get("rsi")
 
        missing = [
            fname
            for fname, fval in (
                ("price", price),
                ("moving_average_20d", ma20),
                ("current_volume", current_volume),
                ("average_volume", average_volume),
                ("rsi", rsi),
            )
            if fval is None
        ]
        if missing:
            return _structured_error(
                symbol,
                f"Required field(s) unavailable for {symbol}: {', '.join(missing)}. "
                "Cannot compute a reliable technical signal.",
                start_time,
            )
 
        # --- 1. Price momentum ---------------------------------------------
        momentum_pct = ((price - ma20) / ma20) * 100 if ma20 else 0.0
        if momentum_pct >= MOMENTUM_SIGNIFICANCE_PCT:
            momentum_score = 1  # bullish
        elif momentum_pct <= -MOMENTUM_SIGNIFICANCE_PCT:
            momentum_score = -1  # bearish
        else:
            momentum_score = 0  # neutral / no significant momentum
 
        # --- 2. Volume anomaly -----------------------------------------------
        volume_ratio = (current_volume / average_volume) if average_volume else 0.0
        volume_anomaly = volume_ratio >= VOLUME_SPIKE_RATIO or volume_ratio <= VOLUME_DROP_RATIO
 
        # --- 3. RSI overbought / oversold -----------------------------------
        if rsi >= RSI_OVERBOUGHT_THRESHOLD:
            rsi_score = -1  # overbought -> bearish tilt
            rsi_state = "overbought"
        elif rsi <= RSI_OVERSOLD_THRESHOLD:
            rsi_score = 1  # oversold -> bullish tilt
            rsi_state = "oversold"
        else:
            rsi_score = 0
            rsi_state = "neutral"
 
        # --- Combine into an overall signal ---------------------------------
        total_score = momentum_score + rsi_score
        if total_score > 0:
            signal = "BULLISH"
        elif total_score < 0:
            signal = "BEARISH"
        else:
            signal = "NEUTRAL"
 
        confidence = _calculate_confidence(
            momentum_pct=momentum_pct,
            momentum_score=momentum_score,
            rsi=rsi,
            rsi_score=rsi_score,
            volume_ratio=volume_ratio,
            volume_anomaly=volume_anomaly,
        )
 
        # --- Evidence (short, explainable strings, no raw data dumps) -------
        evidence = [
            f"Price {price:.2f} vs 20D MA {ma20:.2f} ({momentum_pct:+.2f}%)",
            f"RSI {rsi:.2f} ({rsi_state})",
        ]
        if volume_anomaly:
            evidence.append(f"Volume {current_volume:,} is {volume_ratio:.2f}x average ({average_volume:,})")
        else:
            evidence.append(f"Volume {current_volume:,} is within normal range ({volume_ratio:.2f}x average)")
 
        # --- Summary (plain English, no BUY/SELL instructions) --------------
        momentum_desc = (
            "trading above" if momentum_score == 1
            else "trading below" if momentum_score == -1
            else "trading near"
        )
        summary_parts = [
            f"{symbol} is {momentum_desc} its 20-day moving average"
            f" ({momentum_pct:+.2f}%)."
        ]
        if rsi_state != "neutral":
            summary_parts.append(f"RSI is {rsi_state} at {rsi:.1f}.")
        if volume_anomaly:
            direction = "elevated" if volume_ratio >= VOLUME_SPIKE_RATIO else "unusually low"
            summary_parts.append(f"Trading volume is {direction} ({volume_ratio:.2f}x average).")
        summary = " ".join(summary_parts)
 
        latency_ms = int(round((time.perf_counter() - start_time) * 1000))
 
        return {
            "name": AGENT_NAME,
            "status": "completed",
            "signal": signal,
            "confidence": confidence,
            "summary": summary,
            "evidence": evidence,
            "source": DATA_SOURCE_LABEL,
            "latency": latency_ms,
        }
 
    except Exception as exc:  # noqa: BLE001 - final safety net, must never crash pipeline
        return _structured_error(
            symbol,
            f"Technical agent encountered an internal issue ({exc.__class__.__name__}) "
            "and could not complete analysis for this symbol.",
            start_time,
        )