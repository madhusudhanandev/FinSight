# FinSight AI — Backend

FastAPI backend for **FinSight AI: Multi-Agent Autonomous Financial
Intelligence System for Retail Investors** (hackathon build).

> ⚠️ Demo project. Uses simulated data. **Not financial advice.**

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Swagger docs: http://localhost:8000/docs

## Endpoints

### `GET /api/health`
```json
{ "status": "operational", "agents_ready": 4 }
```

### `POST /api/analyze`
Request:
```json
{ "symbol": "TCS", "profile": "conservative", "simulate_failure": false }
```

- `symbol`: one of `TCS`, `RELIANCE`, `INFY`
- `profile`: `conservative` or `aggressive`
- `simulate_failure`: forces the sentiment agent to report unavailable, to test graceful degradation

Response includes company info, recommendation (`CONSIDER` / `WATCH` /
`AVOID` / `INSUFFICIENT DATA`), confidence, per-agent breakdown,
portfolio exposure, latency, and data completeness.

## Architecture

```
app/
├── main.py                     # FastAPI app, CORS
├── api/routes.py                # /api/health, /api/analyze
├── schemas/analyze.py           # Pydantic request/response models
├── services/orchestrator.py     # Runs all 4 agents concurrently (asyncio.gather)
├── services/synthesis.py        # Weighted, deterministic recommendation logic
└── agents/                      # technical, sentiment, fundamental, portfolio
```

**Agent weights:** Technical 30% · Fundamental 35% · Sentiment 15% · Portfolio 20%

**Resilience:** if any single agent fails or is unavailable, the pipeline
still returns a result — confidence and `dataCompleteness` drop
accordingly, but nothing is invented and nothing crashes.

## ⚠️ Agent placeholders

`app/agents/technical_agent.py`, `sentiment_agent.py`,
`fundamental_agent.py`, and `portfolio_agent.py` are **placeholder
stubs** with randomized/simulated output, included only so this backend
can run and be tested standalone.

- `technical_agent.py` and `sentiment_agent.py` are owned by **Member 2** — real implementation replaces these stubs via PR into `develop`.
- `fundamental_agent.py` and `portfolio_agent.py` are owned by **Member 3** — same process.

Do not build on top of the stub logic — once the real agent PRs land,
these files should be replaced, not merged with the placeholder code.

## Testing checklist

- [x] `/api/health` returns 200
- [x] `/api/analyze` returns 200 for a valid request
- [x] Conservative profile tested
- [x] Aggressive profile tested
- [x] Failed-agent scenario (`simulate_failure: true`) tested — pipeline does not crash
- [x] Invalid symbol returns 422, no stack trace exposed
- [x] Swagger docs load at `/docs`
