"""
Pydantic schemas for FinSight AI.

Owned by: Member 1 (backend/app/schemas/)
Do not edit without coordinating with Member 1 — other members' agent
outputs must conform to AgentResult below.
"""

from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

Profile = Literal["conservative", "aggressive"]
Recommendation = Literal["CONSIDER", "WATCH", "AVOID", "INSUFFICIENT DATA"]
Signal = Literal["BULLISH", "BEARISH", "NEUTRAL", "UNAVAILABLE"]
Concentration = Literal["LOW", "MODERATE", "HIGH", "UNKNOWN"]

# Symbols supported in this demo. Extend as Member 2 / Member 3 add data.
SUPPORTED_SYMBOLS = {"TCS", "RELIANCE", "INFY"}


class AnalyzeRequest(BaseModel):
    symbol: str = Field(..., description="Stock ticker, e.g. TCS")
    profile: Profile = Field(..., description="Investor risk profile")
    simulate_failure: bool = Field(
        default=False,
        description="If true, forces a simulated agent failure for testing",
    )

    @field_validator("symbol")
    @classmethod
    def normalize_symbol(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("symbol must not be empty")
        symbol = v.strip().upper()
        if symbol not in SUPPORTED_SYMBOLS:
            raise ValueError(
                f"symbol must be one of {sorted(SUPPORTED_SYMBOLS)}"
            )
        return symbol


class AgentResult(BaseModel):
    """Shared contract every agent (technical, sentiment, fundamental,
    portfolio) must return. Owned jointly — do not change without
    notifying Members 2 and 3."""

    name: str
    status: Literal["completed", "unavailable", "failed"]
    signal: Signal
    confidence: int = Field(ge=0, le=100)
    summary: str
    evidence: List[str] = Field(default_factory=list)
    source: str
    latency: int = Field(ge=0, description="Latency in milliseconds")


class HealthResponse(BaseModel):
    status: Literal["operational"]
    agents_ready: int


class AnalyzeResponse(BaseModel):
    company: str
    symbol: str
    price: float
    change: float
    recommendation: Recommendation
    confidence: int = Field(ge=0, le=100)
    summary: str
    agents: List[AgentResult]
    currentExposure: float
    projectedExposure: float
    concentration: Concentration
    totalLatency: int
    dataCompleteness: int = Field(ge=0, le=100)
    warning: Optional[str] = None
