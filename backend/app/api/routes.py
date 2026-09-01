"""
API routes — owned by Member 1 (backend/app/api/).
"""

from fastapi import APIRouter, HTTPException

from app.schemas.analyze import AnalyzeRequest, AnalyzeResponse, HealthResponse
from app.services.orchestrator import run_pipeline
from app.services.synthesis import synthesize

router = APIRouter()


@router.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="operational", agents_ready=4)


@router.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        agent_results, total_latency_ms = await run_pipeline(
            symbol=request.symbol,
            profile=request.profile,
            simulate_failure=request.simulate_failure,
        )

        result = synthesize(
            symbol=request.symbol,
            profile=request.profile,
            agents=agent_results,
        )
        result["totalLatency"] = total_latency_ms

        return AnalyzeResponse(**result)

    except Exception:
        # Never leak stack traces or internals to the client.
        raise HTTPException(
            status_code=500,
            detail="Analysis failed due to an internal error. Please try again.",
        )
