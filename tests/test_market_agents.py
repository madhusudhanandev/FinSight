"""
test_market_agents.py
 
Purpose:
    Test suite for the Member 2 agents: technical_agent and sentiment_agent.
    Covers the required cases from MEM2_MARKET_AGENTS_RULES.md Section 7:
      - normal case for each symbol (TCS, RELIANCE, INFY)
      - unusual/anomalous volume
      - overbought RSI (and oversold RSI)
      - missing/invalid symbol handled without raising
      - sentiment POSITIVE / MIXED / NEGATIVE / UNAVAILABLE cases
      - simulate_failure=True never raises and returns UNAVAILABLE
      - full contract shape/type validation for every returned dict
 
Run with:
    pytest tests/test_market_agents.py -v
 
Note: async agent functions are driven with asyncio.run() directly rather
than relying on a pytest-asyncio plugin, so this suite has no extra
dependency beyond `pytest` itself.
"""
 
import asyncio
import sys
from pathlib import Path
 
import pytest
 
# Make sure the repo root is importable regardless of where pytest is invoked from.
_REPO_ROOT = Path(__file__).resolve().parents[1]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))
 
from backend.app.agents.technical_agent import technical_agent  # noqa: E402
from backend.app.agents.sentiment_agent import sentiment_agent  # noqa: E402
 
 
VALID_SYMBOLS = ["TCS", "RELIANCE", "INFY"]
 
REQUIRED_CONTRACT_KEYS = {
    "name": str,
    "status": str,
    "signal": str,
    "confidence": (int, float),
    "summary": str,
    "evidence": list,
    "source": str,
    "latency": (int, float),
}
 
 
def run(coro):
    """Helper to run an async agent call from a sync pytest test."""
    return asyncio.run(coro)
 
 
def assert_contract_shape(result: dict):
    for key, expected_type in REQUIRED_CONTRACT_KEYS.items():
        assert key in result, f"Missing required contract key: {key}"
        assert isinstance(result[key], expected_type), (
            f"Key '{key}' expected type {expected_type}, got {type(result[key])}"
        )
    assert result["confidence"] >= 0
    assert result["confidence"] <= 100
    assert result["latency"] >= 0
 
 
# ---------------------------------------------------------------------------
# Technical agent - normal cases
# ---------------------------------------------------------------------------
 
@pytest.mark.parametrize("symbol", VALID_SYMBOLS)
def test_technical_agent_normal_case_returns_contract_shape(symbol):
    result = run(technical_agent(symbol))
    assert_contract_shape(result)
    assert result["signal"] in {"BULLISH", "BEARISH", "NEUTRAL"}
    assert result["name"] == "Technical Analysis Agent"
    assert result["status"] == "completed"
    # No BUY/SELL instructions anywhere in output text.
    combined_text = (result["summary"] + " ".join(result["evidence"])).upper()
    assert "BUY" not in combined_text
    assert "SELL" not in combined_text
 
 
def test_technical_agent_unusual_volume_is_flagged():
    # TCS in the simulated dataset has current_volume ~2.3x average_volume.
    result = run(technical_agent("TCS"))
    assert_contract_shape(result)
    evidence_text = " ".join(result["evidence"]).lower()
    assert "average" in evidence_text
    assert "x average" in evidence_text
    # A volume anomaly should be reflected in a non-trivial confidence score.
    assert result["confidence"] > 0
 
 
def test_technical_agent_overbought_rsi_detected():
    # INFY in the simulated dataset has RSI >= 70 (overbought).
    result = run(technical_agent("INFY"))
    assert_contract_shape(result)
    evidence_text = " ".join(result["evidence"]).lower()
    assert "overbought" in evidence_text
    # Overbought RSI should push the signal toward BEARISH or at least
    # prevent an unqualified BULLISH read driven by momentum alone.
    assert result["signal"] in {"BEARISH", "NEUTRAL"}
 
 
def test_technical_agent_oversold_rsi_detected():
    # RELIANCE in the simulated dataset has RSI <= 30 (oversold).
    result = run(technical_agent("RELIANCE"))
    assert_contract_shape(result)
    evidence_text = " ".join(result["evidence"]).lower()
    assert "oversold" in evidence_text
    assert result["signal"] in {"BULLISH", "NEUTRAL"}
 
 
def test_technical_agent_invalid_symbol_does_not_raise():
    # Should never raise - must return a structured response.
    result = run(technical_agent("DOGE"))
    assert_contract_shape(result)
    assert result["status"] == "completed"
    assert "not recognized" in result["summary"].lower()
    assert result["confidence"] == 0
 
 
def test_technical_agent_empty_symbol_does_not_raise():
    result = run(technical_agent(""))
    assert_contract_shape(result)
    assert result["status"] == "completed"
 
 
# ---------------------------------------------------------------------------
# Sentiment agent - normal cases (deterministic outcomes from sample data)
# ---------------------------------------------------------------------------
 
def test_sentiment_agent_positive_case():
    # TCS sample headlines are designed to be majority positive, no negatives.
    result = run(sentiment_agent("TCS"))
    assert_contract_shape(result)
    assert result["signal"] == "BULLISH"
    assert result["confidence"] > 0
    assert result["name"] == "News Sentiment Agent"
 
 
def test_sentiment_agent_mixed_case():
    # RELIANCE sample headlines contain both positive and negative tags.
    result = run(sentiment_agent("RELIANCE"))
    assert_contract_shape(result)
    assert result["signal"] == "NEUTRAL"
    assert result["confidence"] > 0
 
 
def test_sentiment_agent_negative_case():
    # INFY sample headlines are designed to be majority negative, no positives.
    result = run(sentiment_agent("INFY"))
    assert_contract_shape(result)
    assert result["signal"] == "BEARISH"
    assert result["confidence"] > 0
 
 
@pytest.mark.parametrize("symbol", VALID_SYMBOLS)
def test_sentiment_agent_no_buy_sell_language(symbol):
    result = run(sentiment_agent(symbol))
    combined_text = (result["summary"] + " ".join(result["evidence"])).upper()
    assert "BUY" not in combined_text
    assert "SELL" not in combined_text
 
 
# ---------------------------------------------------------------------------
# Sentiment agent - failure / unavailable cases
# ---------------------------------------------------------------------------
 
def test_sentiment_agent_simulate_failure_never_raises():
    # Must not raise, and must return a structured UNAVAILABLE response.
    result = run(sentiment_agent("TCS", simulate_failure=True))
    assert_contract_shape(result)
    assert result["signal"] == "UNAVAILABLE"
    assert result["confidence"] == 0
    assert result["status"] == "completed"
 
 
def test_sentiment_agent_invalid_symbol_does_not_raise():
    result = run(sentiment_agent("DOGE"))
    assert_contract_shape(result)
    assert result["signal"] == "UNAVAILABLE"
    assert result["confidence"] == 0
 
 
def test_sentiment_agent_missing_headlines_degrades_gracefully(monkeypatch):
    # Simulate a symbol with no headlines in the dataset by monkeypatching
    # the loader, to confirm the "no headlines found" path degrades to
    # UNAVAILABLE instead of raising (Section 4.4).
    import backend.app.agents.sentiment_agent as sentiment_module
 
    monkeypatch.setattr(sentiment_module, "_load_news_data", lambda: {"TCS": []})
 
    result = run(sentiment_agent("TCS"))
    assert_contract_shape(result)
    assert result["signal"] == "UNAVAILABLE"
    assert result["confidence"] == 0
 
 
# ---------------------------------------------------------------------------
# Contract validation across every case (belt-and-suspenders)
# ---------------------------------------------------------------------------
 
@pytest.mark.parametrize("symbol", VALID_SYMBOLS + ["INVALID"])
def test_all_technical_agent_outputs_match_contract(symbol):
    result = run(technical_agent(symbol))
    assert_contract_shape(result)
 
 
@pytest.mark.parametrize("symbol", VALID_SYMBOLS + ["INVALID"])
def test_all_sentiment_agent_outputs_match_contract(symbol):
    result = run(sentiment_agent(symbol))
    assert_contract_shape(result)
 
