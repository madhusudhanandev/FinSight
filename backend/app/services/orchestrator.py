"""
Orchestrator — owned by Member 1 (backend/app/services/orchestrator.py).

Runs all four specialized agents concurrently via asyncio.gather() and
guarantees that a single agent failure never crashes the whole pipeline.
Never invents data for a missing/failed agent — it is reported as
"failed"/"unavailable" instead.
"""

import asyncio
import time
from typing import List

from app.agents.technical_agent import technical_agent
from app.agents.sentiment_agent import sentiment_agent
from app.agents.fundamental_agent import fundamental_agent
from app.agents.portfolio_agent import portfolio_agent


def _failed_result(name: str, source: str) -> dict:
    """Structured fallback when an agent raises instead of returning
    a graceful 'unavailable' result itself."""
    return {
        "name": name,
        "status": "failed",
        "signal": "UNAVAILABLE",
        "confidence": 0,
        "summary": f"{name} raised an unexpected error and produced no result.",
        "evidence": [],
        "source": source,
        "latency": 0,
    }


async def _run_agent(coro, name: str, source: str) -> dict:
    """Wrap a single agent call so an exception never propagates up
    and crashes asyncio.gather() for the whole batch."""
    try:
        result = await coro
        return result
    except Exception:
        return _failed_result(name, source)


async def run_agents(symbol: str, profile: str, simulate_failure: bool) -> List[dict]:
    """Run technical, sentiment, fundamental and portfolio agents
    concurrently. Returns a list of AgentResult-shaped dicts in a
    fixed order: [technical, sentiment, fundamental, portfolio]."""

    tasks = [
        _run_agent(
            technical_agent(symbol),
            "Technical Analysis Agent",
            "Simulated market data (placeholder)",
        ),
        _run_agent(
            sentiment_agent(symbol, simulate_failure=simulate_failure),
            "News Sentiment Agent",
            "Simulated news feed (placeholder)",
        ),
        _run_agent(
            fundamental_agent(symbol),
            "Fundamental Agent",
            "Simulated financial documents (placeholder)",
        ),
        _run_agent(
            portfolio_agent(symbol, profile),
            "Portfolio Risk Agent",
            "Simulated portfolio data (placeholder)",
        ),
    ]

    results = await asyncio.gather(*tasks)
    return list(results)


async def run_pipeline(symbol: str, profile: str, simulate_failure: bool):
    """Run the full agent pipeline and return (agent_results, total_latency_ms)."""
    start = time.perf_counter()
    agent_results = await run_agents(symbol, profile, simulate_failure)
    total_latency_ms = int((time.perf_counter() - start) * 1000)
    return agent_results, total_latency_ms
