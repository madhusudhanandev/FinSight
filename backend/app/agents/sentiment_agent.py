"""
sentiment_agent.py
 
Purpose:
    Classifies news sentiment for a single stock symbol (TCS, RELIANCE, or
    INFY) using a small set of sample/simulated headlines, each pre-tagged
    with a polarity label. Classification is rule-based and deterministic
    (no LLM free-form guessing), so results are reproducible.
 
Inputs:
    symbol (str): One of "TCS", "RELIANCE", "INFY". Any other value is
        handled gracefully (no exception raised).
    simulate_failure (bool): When True, forces a structured UNAVAILABLE
        response without raising - used to test pipeline resilience.
 
Outputs:
    dict matching the FinSight AI universal agent output contract (see
    MEM2_MARKET_AGENTS_RULES.md, Section 5):
        {
          "name": str,
          "status": "completed",
          "signal": "POSITIVE" | "MIXED" | "NEGATIVE" | "UNAVAILABLE",
          "confidence": int,   # 0-100, rule-derived
          "summary": str,
          "evidence": list[str],
          "source": str,
          "latency": int       # milliseconds
        }
 
Owner: Member 2 (mem2) - News Sentiment Agent.
Do not modify the output contract shape without coordinating with the
orchestrator/synthesis owner (Member 3).
"""
 
import json
import time
from pathlib import Path
 
# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
 
AGENT_NAME = "News Sentiment Agent"
DATA_SOURCE_LABEL = "Simulated News Sample"
 
VALID_SYMBOLS = {"TCS", "RELIANCE", "INFY"}
 
# backend/app/agents/sentiment_agent.py -> parents[3] is the repo root
_REPO_ROOT = Path(__file__).resolve().parents[3]
NEWS_DATA_PATH = _REPO_ROOT / "data" / "news_data.json"
 
MAX_EVIDENCE_HEADLINES = 3
 
 
# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
 
def _load_news_data() -> dict:
    """Load the simulated news data file. Raises on hard I/O failure so the
    caller's try/except can convert it into a structured, non-crashing
    response."""
    with open(NEWS_DATA_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("symbols", {})
 
 
def _unavailable_response(summary: str, start_time: float) -> dict:
    """Structured UNAVAILABLE response used for simulated failures, missing
    headlines, load errors, or invalid symbols. Never raises."""
    latency_ms = int(round((time.perf_counter() - start_time) * 1000))
    return {
        "name": AGENT_NAME,
        "status": "completed",
        "signal": "UNAVAILABLE",
        "confidence": 0,
        "summary": summary,
        "evidence": [],
        "source": DATA_SOURCE_LABEL,
        "latency": latency_ms,
    }
 
 
def _classify(headlines: list) -> tuple:
    """
    Deterministic, rule-based sentiment classification over pre-tagged
    sample headlines (documented per MEM2 rules Section 4.3).
 
    Rule:
        pos = count of headlines tagged "positive"
        neg = count of headlines tagged "negative"
        (headlines tagged "neutral" are counted but do not drive polarity)
 
        pos > 0 and neg == 0  -> POSITIVE
        neg > 0 and pos == 0  -> NEGATIVE
        pos > 0 and neg > 0   -> MIXED
        pos == 0 and neg == 0 -> UNAVAILABLE (no usable polarity signal)
 
    Confidence (0-100), rule-derived from the proportion of headlines that
    support the winning signal, out of the total headline count:
        POSITIVE / NEGATIVE : 50 + min(dominant_ratio * 40, 40)
        MIXED                : 55 - min(abs(pos - neg) / total * 25, 25)
                                (more balanced pos/neg -> lower confidence
                                 because the picture is genuinely mixed)
        UNAVAILABLE          : 0
    """
    pos = sum(1 for h in headlines if h.get("polarity") == "positive")
    neg = sum(1 for h in headlines if h.get("polarity") == "negative")
    total = len(headlines)
 
    if pos > 0 and neg == 0:
        signal = "POSITIVE"
        dominant_ratio = pos / total if total else 0
        confidence = int(round(50 + min(dominant_ratio * 40, 40)))
    elif neg > 0 and pos == 0:
        signal = "NEGATIVE"
        dominant_ratio = neg / total if total else 0
        confidence = int(round(50 + min(dominant_ratio * 40, 40)))
    elif pos > 0 and neg > 0:
        signal = "MIXED"
        confidence = int(round(55 - min(abs(pos - neg) / total * 25, 25))) if total else 0
    else:
        signal = "UNAVAILABLE"
        confidence = 0
 
    return signal, confidence, pos, neg, total
 
 
# ---------------------------------------------------------------------------
# Public agent entrypoint
# ---------------------------------------------------------------------------
 
async def sentiment_agent(symbol: str, simulate_failure: bool = False) -> dict:
    """
    Classify news sentiment for `symbol` using the sample/simulated headlines
    in data/news_data.json, and return a contract-shaped signal. Never raises.
    """
    start_time = time.perf_counter()
 
    try:
        # --- Explicit failure simulation (Section 4.4) ----------------------
        if simulate_failure:
            return _unavailable_response(
                "News sentiment analysis is unavailable for this run "
                "(simulated failure).",
                start_time,
            )
 
        # --- Symbol validation -----------------------------------------------
        symbol = (symbol or "").strip().upper()
        if symbol not in VALID_SYMBOLS:
            return _unavailable_response(
                f"Symbol '{symbol or '(empty)'}' is not recognized. "
                f"Supported symbols: {', '.join(sorted(VALID_SYMBOLS))}.",
                start_time,
            )
 
        try:
            news_data = _load_news_data()
        except (OSError, json.JSONDecodeError) as exc:
            return _unavailable_response(
                f"News data could not be loaded ({exc.__class__.__name__}). "
                "Sentiment signal unavailable for this run.",
                start_time,
            )
 
        headlines = news_data.get(symbol) or []
        if not headlines:
            # Real "no headlines found" failure case - degrade gracefully,
            # never crash (Section 4.4).
            return _unavailable_response(
                f"No sample headlines available for {symbol}.",
                start_time,
            )
 
        signal, confidence, pos, neg, total = _classify(headlines)
 
        if signal == "UNAVAILABLE":
            return _unavailable_response(
                f"Headlines for {symbol} did not contain a usable positive/negative "
                "signal (neutral-only sample).",
                start_time,
            )
 
        # --- Evidence: short headline snippets with their tag ----------------
        relevant = [h for h in headlines if h.get("polarity") in ("positive", "negative")]
        evidence = [
            f"\"{h.get('headline', '')[:90]}\" ({h.get('polarity')})"
            for h in relevant[:MAX_EVIDENCE_HEADLINES]
        ]
 
        # --- Summary (plain English, no BUY/SELL instructions) ---------------
        if signal == "POSITIVE":
            summary = (
                f"News sentiment for {symbol} is predominantly positive "
                f"({pos} positive / {total} sample headlines)."
            )
        elif signal == "NEGATIVE":
            summary = (
                f"News sentiment for {symbol} is predominantly negative "
                f"({neg} negative / {total} sample headlines)."
            )
        else:  # MIXED
            summary = (
                f"News sentiment for {symbol} is mixed "
                f"({pos} positive, {neg} negative out of {total} sample headlines)."
            )
 
        latency_ms = int(round((time.perf_counter() - start_time) * 1000))
 
        return {
            "name": AGENT_NAME,
            "status": "completed",
            "signal": {
		"POSITIVE": "BULLISH",
   		"MIXED": "NEUTRAL",
    		"NEGATIVE": "BEARISH",
	    }.get(signal, "UNAVAILABLE"),
            "confidence": confidence,
            "summary": summary,
            "evidence": evidence,
            "source": DATA_SOURCE_LABEL,
            "latency": latency_ms,
        }
 
    except Exception as exc:  # noqa: BLE001 - final safety net, must never crash pipeline
        return _unavailable_response(
            f"Sentiment agent encountered an internal issue ({exc.__class__.__name__}) "
            "and could not complete analysis for this symbol.",
            start_time,
        )
 
