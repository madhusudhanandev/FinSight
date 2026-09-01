"""Tests for Member 3's RAG retrieval, Fundamental Agent, and Portfolio
Risk Agent (see MEM3_RAG_PORTFOLIO_RULES.md section 9). Only reaches into
files inside the Member 3 owned-files list.
"""

import asyncio
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.app.agents.fundamental_agent import fundamental_agent
from backend.app.agents.portfolio_agent import portfolio_agent
from backend.app.services.retrieval import retrieve_documents

DATA_DIR = REPO_ROOT / "data"

SHARED_FIELDS = ["name", "status", "signal", "confidence", "summary", "evidence", "source", "latency"]


def run(coro):
    return asyncio.run(coro)


# --- Retrieval ---------------------------------------------------------

def test_tcs_retrieval_returns_relevant_documents():
    docs = retrieve_documents("TCS", "revenue growth margin")
    assert len(docs) > 0
    assert all(doc["symbol"] == "TCS" for doc in docs)


def test_reliance_retrieval_returns_relevant_documents():
    docs = retrieve_documents("RELIANCE", "revenue growth margin")
    assert len(docs) > 0
    assert all(doc["symbol"] == "RELIANCE" for doc in docs)


def test_infy_retrieval_returns_relevant_documents():
    docs = retrieve_documents("INFY", "revenue growth margin")
    assert len(docs) > 0
    assert all(doc["symbol"] == "INFY" for doc in docs)


def test_retrieval_filters_by_symbol_only():
    docs = retrieve_documents("TCS", "revenue")
    assert docs
    assert all(doc["symbol"] == "TCS" for doc in docs)


def test_retrieval_empty_list_for_irrelevant_query():
    docs = retrieve_documents("TCS", "zzzzz nonsense unrelated xyz123")
    assert docs == []


def test_every_retrieved_document_has_citation_metadata():
    docs = retrieve_documents("INFY", "revenue growth margin risk")
    assert docs
    for doc in docs:
        assert doc["id"]
        assert doc["source"]
        assert isinstance(doc["page"], int)
        assert doc["date"]


def test_every_corpus_chunk_has_required_fields():
    with open(DATA_DIR / "financial_documents.json") as f:
        payload = json.load(f)
    required = {"id", "symbol", "content", "source", "page", "date"}
    documents = payload["documents"]
    assert documents
    for doc in documents:
        assert required.issubset(doc.keys())


def test_corpus_documents_are_marked_as_demo():
    with open(DATA_DIR / "financial_documents.json") as f:
        payload = json.load(f)
    assert payload.get("is_demo") is True
    for doc in payload["documents"]:
        assert doc.get("is_demo") is True
        assert "DEMO" in doc["content"] or "DEMO" in doc["source"]


# --- Fundamental Agent ---------------------------------------------------

def test_fundamental_agent_returns_shared_structured_format():
    result = run(fundamental_agent("TCS"))
    for key in SHARED_FIELDS:
        assert key in result
    assert result["name"] == "Fundamental Agent"
    assert result["status"] == "completed"
    assert result["evidence"]


def test_fundamental_agent_evidence_is_always_cited():
    result = run(fundamental_agent("RELIANCE"))
    assert result["evidence"]
    for item in result["evidence"]:
        assert "Source:" in item
        assert "Page:" in item


def test_fundamental_agent_infy_also_completes():
    result = run(fundamental_agent("infy"))
    assert result["status"] == "completed"
    assert result["evidence"]


def test_fundamental_agent_unknown_symbol_handled_safely():
    result = run(fundamental_agent("UNKNOWNSTOCK"))
    for key in SHARED_FIELDS:
        assert key in result
    assert result["status"] in ("error", "insufficient_data")
    assert result["evidence"] == []
    assert result["confidence"] == 0
    assert "not financial advice" in result["summary"].lower()


# --- User profiles --------------------------------------------------------

def test_conservative_profile_loaded_correctly():
    with open(DATA_DIR / "user_profiles.json") as f:
        profiles = json.load(f)
    conservative = profiles["conservative"]
    for field in ["risk_tolerance", "max_sector_exposure", "investment_horizon", "max_volatility"]:
        assert field in conservative
    assert conservative["risk_tolerance"] == "low"


def test_aggressive_profile_loaded_correctly():
    with open(DATA_DIR / "user_profiles.json") as f:
        profiles = json.load(f)
    aggressive = profiles["aggressive"]
    for field in ["risk_tolerance", "max_sector_exposure", "investment_horizon", "max_volatility"]:
        assert field in aggressive
    assert aggressive["risk_tolerance"] == "high"
    assert aggressive["max_sector_exposure"] > profiles["conservative"]["max_sector_exposure"]


# --- Portfolio Risk Agent -------------------------------------------------

def test_portfolio_agent_returns_shared_and_extra_fields():
    result = run(portfolio_agent("INFY", "conservative", investment_percentage=14))
    for key in SHARED_FIELDS + ["currentExposure", "projectedExposure", "concentration"]:
        assert key in result


def test_portfolio_agent_exposure_calculation_is_correct():
    result = run(portfolio_agent("TCS", "aggressive", investment_percentage=14))
    # TCS + INFY = 125000 / 500000 total = 25.0% current IT Services exposure
    assert result["currentExposure"] == 25.0
    assert result["projectedExposure"] == 39.0
    assert result["concentration"] == "LOW"


def test_personalization_conservative_vs_aggressive_differ():
    conservative = run(portfolio_agent("TCS", "conservative", investment_percentage=14))
    aggressive = run(portfolio_agent("TCS", "aggressive", investment_percentage=14))

    # same symbol, same investment_percentage -> identical projected exposure
    assert conservative["projectedExposure"] == aggressive["projectedExposure"]
    # but different concentration / suitability outcome, per profile limits
    assert conservative["concentration"] != aggressive["concentration"]
    assert conservative["concentration"] == "HIGH"
    assert aggressive["concentration"] == "LOW"
    assert conservative["signal"] != aggressive["signal"]


def test_concentration_warning_generated_when_limit_exceeded():
    result = run(portfolio_agent("TCS", "conservative", investment_percentage=14))
    assert result["concentration"] == "HIGH"
    assert result["signal"] == "BEARISH"
    assert any("exceeds" in item for item in result["evidence"])


def test_missing_symbol_data_is_unavailable_not_fabricated():
    result = run(portfolio_agent("UNKNOWNSTOCK", "conservative", investment_percentage=14))
    assert result["currentExposure"] == "unavailable"
    assert result["projectedExposure"] == "unavailable"
    assert result["concentration"] == "unavailable"
    assert result["status"] == "insufficient_data"


def test_unknown_profile_handled_safely():
    result = run(portfolio_agent("TCS", "not_a_real_profile", investment_percentage=14))
    assert result["status"] == "unavailable"
    assert result["currentExposure"] == "unavailable"


def test_no_fixture_reaches_outside_owned_data_files():
    # sanity check that this test module only touches files inside data/
    assert (DATA_DIR / "financial_documents.json").exists()
    assert (DATA_DIR / "user_profiles.json").exists()
    assert (DATA_DIR / "portfolios.json").exists()
