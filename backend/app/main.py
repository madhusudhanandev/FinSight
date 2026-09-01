"""
FastAPI entrypoint — owned by Member 1 (backend/app/main.py).

Run locally with:
    uvicorn app.main:app --reload --port 8000

Then open Swagger docs at:
    http://localhost:8000/docs
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.routes import router

app = FastAPI(
    title="FinSight AI Backend",
    description=(
        "Multi-Agent Autonomous Financial Intelligence System for Retail "
        "Investors — backend API. Demo/hackathon project. Not financial "
        "advice."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    # Return a clean 400 without exposing internal details.
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid request payload."},
    )
