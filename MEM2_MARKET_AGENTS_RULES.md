# MEM2 — Market Data, Technical Analysis & News Sentiment Agent Rules

**Project:** FinSight AI — Multi-Agent Autonomous Financial Intelligence System for Retail Investors
**Member:** Member 2
**Branch:** `mem2`
**Role:** Market Data, Technical Analysis Agent, News Sentiment Agent

This document is a strict contract. Follow it exactly. It exists so four people can build in parallel for four hours without breaking each other's code.

---

## 1. Ownership

### 1.1 Files you own (only you edit these)

- `backend/app/agents/technical_agent.py`
- `backend/app/agents/sentiment_agent.py`
- `data/market_data.json`
- `data/news_data.json`
- `tests/test_market_agents.py`

### 1.2 Files you must NOT touch

- `frontend/` (entire directory)
- `backend/app/main.py`
- Any orchestrator or synthesis file (e.g. `backend/app/orchestrator/*`, `backend/app/agents/synthesis_agent.py`, anything that combines agent outputs)
- Any RAG or portfolio file (e.g. `backend/app/rag/*`, `backend/app/agents/portfolio_agent.py`)
- The `main` branch — never commit or push directly to `main`

If a task seems to require touching one of these, stop and coordinate with the owning member instead of editing it yourself.

### 1.3 Branch discipline

- All work happens on `mem2`.
- Never force-push.
- Never merge `main` into `mem2` without checking with the team first (avoid pulling in half-finished work from others mid-hackathon).
- If you need a file that doesn't exist yet (e.g. a shared schema or interfaces file another member owns), ask in the team channel — do not create a duplicate or edit their file directly.

---

## 2. Simulated Market Data (`data/market_data.json`)

You must prepare simulated (not real, not live-fetched) market data for exactly these three symbols:

- `TCS`
- `RELIANCE`
- `INFY`

### 2.1 Required fields per symbol

Each symbol entry must include:

| Field | Description |
|---|---|
| `company` | Full company name |
| `sector` | Sector classification |
| `price` | Current simulated price |
| `daily_change` | Change (absolute and/or %) for the day |
| `recent_closes` | Array of recent closing prices (enough points to compute a 20-day moving average, e.g. 20+ values) |
| `moving_average_20d` | 20-day moving average, computed from `recent_closes` |
| `current_volume` | Simulated current trading volume |
| `average_volume` | Baseline/average volume for comparison |
| `rsi` | Relative Strength Index value |
| `volatility` | A volatility measure (e.g. stddev of recent closes, or % range) |

### 2.2 Data rules

- All values must be internally consistent (e.g. `moving_average_20d` must actually be the average of the values in `recent_closes`, not a random number).
- Label the file/data clearly as simulated — include a top-level field such as `"data_type": "simulated"` or a comment/metadata block. This dataset must never be presented as live market data.
- Do not fabricate values for anything the pipeline should treat as "unavailable" — if a value cannot be reasonably simulated, mark it explicitly (e.g. `null` with a status flag) rather than inventing a plausible-looking number.
- Keep numbers realistic for NSE-listed large caps (TCS, RELIANCE, INFY) — order-of-magnitude sanity matters even in simulation.

---

## 3. Technical Analysis Agent (`backend/app/agents/technical_agent.py`)

### 3.1 Required signature

```python
async def technical_agent(symbol: str) -> dict:
    ...
```

### 3.2 Required evaluation logic

The agent must evaluate **at least** the following, using the data from `data/market_data.json`:

1. **Price momentum** — e.g. current price vs. moving average, or recent close trend direction.
2. **Volume anomaly** — e.g. current volume vs. average volume, flag when it deviates significantly (spike or drop).
3. **RSI** — flag overbought (typically ≥ 70) and oversold (typically ≤ 30) conditions.

### 3.3 Confidence calculation

- Technical confidence must be calculated using **explicit, deterministic rules** (e.g. weighted scoring based on how many of the momentum/volume/RSI checks align, distance from thresholds, etc.).
- **Do not** ask an LLM to invent or guess a confidence number. No `"confidence": <llm free-form guess>`. The number must be traceable back to code you wrote.
- Document the rule/formula in a code comment directly above the confidence calculation so it's auditable in review.

### 3.4 Symbol validation

- Validate `symbol` against the known set (`TCS`, `RELIANCE`, `INFY`) before doing anything else.
- If `symbol` is invalid/unknown, return a structured response with `"status": "completed"` or an appropriate error status and a clear `summary` explaining the symbol was not recognized — **do not raise an unhandled exception** that would crash the orchestrator pipeline.

---

## 4. News Sentiment Agent (`backend/app/agents/sentiment_agent.py`)

### 4.1 Required signature

```python
async def sentiment_agent(
    symbol: str,
    simulate_failure: bool = False
) -> dict:
    ...
```

### 4.2 Sample headlines (`data/news_data.json`)

- Prepare a small set of sample/simulated headlines per symbol (TCS, RELIANCE, INFY).
- Clearly label this data as sample/simulated (e.g. `"data_type": "simulated_sample_news"`). It must never be presented to the end user as real, current news.
- Each headline entry should carry enough info to classify sentiment (headline text, and optionally a pre-tagged polarity for simulation purposes).

### 4.3 Sentiment classification

The agent must be able to produce each of these sentiment outcomes depending on input data:

- `POSITIVE`
- `MIXED`
- `NEGATIVE`
- `UNAVAILABLE`

Classification logic should be rule-based/deterministic over the sample headlines (e.g. counting positive vs. negative signal words/tags, or using the pre-tagged polarity), so results are reproducible.

### 4.4 Failure simulation

- When `simulate_failure=True`, the function must return a **structured** output with `"status"` reflecting failure/unavailability and `"signal"`/sentiment as `UNAVAILABLE`.
- **Never** raise an exception that propagates out and stops the pipeline when `simulate_failure=True`. Catch it internally and return the standard contract shape below.
- This must also apply to *real* failure cases (e.g. no headlines found for a symbol) — always degrade gracefully to `UNAVAILABLE`, never crash.

---

## 5. Universal Output Contract

**Every** agent output (technical and sentiment, success or failure) must be a dict matching this exact shape:

```json
{
  "name": "Agent name",
  "status": "completed",
  "signal": "BULLISH",
  "confidence": 78,
  "summary": "Short explanation",
  "evidence": [],
  "source": "Source name",
  "latency": 386
}
```

Field notes:

- `name` — human-readable agent name (e.g. `"Technical Analysis Agent"`, `"News Sentiment Agent"`).
- `status` — `"completed"` for normal runs; use a consistent alternate value (e.g. `"unavailable"` or `"failed"`) only if the team has agreed on it — check with the team before introducing new status values.
- `signal` — one of the agreed enum values (e.g. `BULLISH` / `BEARISH` / `NEUTRAL` for technical; `POSITIVE` / `MIXED` / `NEGATIVE` / `UNAVAILABLE` for sentiment). Never invent new signal strings without coordinating.
- `confidence` — integer/number, rule-derived (see Section 3.3). For `UNAVAILABLE` sentiment, use a low/zero confidence, not a guessed high number.
- `summary` — one or two plain-English sentences. No jargon dump.
- `evidence` — a short list (strings or small dicts) backing the signal, e.g. `["RSI 74 (overbought)", "Volume 2.1x average"]`. Keep each entry short and explainable — no raw data dumps.
- `source` — where the data came from (e.g. `"Simulated Market Data"`, `"Simulated News Sample"`). Always be honest that it's simulated.
- `latency` — measured execution time of the agent call in milliseconds (actually measure it, don't hardcode).

**Do not change this contract shape** without coordinating with the orchestrator/synthesis owner — other agents and the orchestrator depend on this exact structure.

---

## 6. Hard Rules (non-negotiable)

1. **Validate all stock symbols.** Reject/handle unknown symbols gracefully in both agents.
2. **Never fabricate unavailable market values.** If data isn't there, say so (`UNAVAILABLE` / `null` + flag) — don't invent a plausible number.
3. **Clearly label demo data as simulated** in both the data files and agent output (`source` field, metadata).
4. **Do not present sample news as real current news.** No language implying live/breaking news.
5. **Keep evidence short and explainable.** Bullet-style short strings, not paragraphs or raw JSON blobs.
6. **Do not include direct BUY or SELL instructions** anywhere in `summary` or `evidence`. Describe signals and confidence only — this is an information system, not investment advice.
7. **Test unusual volume, overbought RSI, and missing symbols** explicitly in your test suite (see Section 7).
8. **Coordinate before changing the output contract.** Any change to the shape in Section 5 requires a heads-up to the team (especially whoever owns orchestration/synthesis) before you push.

---

## 7. Testing Requirements (`tests/test_market_agents.py`)

At minimum, write tests covering:

- **Technical agent:**
  - Normal case for each of TCS, RELIANCE, INFY returns the full contract shape.
  - Unusual/anomalous volume triggers the volume-anomaly flag and affects confidence/signal appropriately.
  - Overbought RSI (≥ 70) is correctly detected and reflected in signal/evidence.
  - (Optional but recommended) Oversold RSI (≤ 30) case.
  - Missing/invalid symbol is handled without raising — returns a structured response.

- **Sentiment agent:**
  - Normal case returns `POSITIVE`, `MIXED`, or `NEGATIVE` correctly based on sample headlines.
  - `simulate_failure=True` returns `UNAVAILABLE` with the full contract shape and does **not** raise.
  - Missing/invalid symbol is handled without raising.

- **Contract validation:**
  - Assert every returned dict contains all required keys from Section 5 with correct types.

Run tests locally before every push:

```bash
pytest tests/test_market_agents.py -v
```

---

## 8. Completion Checklist

Check off before pushing:

- [ ] `data/market_data.json` created with TCS, RELIANCE, INFY and all required fields.
- [ ] Market data internally consistent (moving average actually matches recent closes) and labeled `simulated`.
- [ ] `data/news_data.json` created with sample headlines per symbol, labeled `simulated_sample_news`.
- [ ] `technical_agent(symbol: str) -> dict` implemented in `backend/app/agents/technical_agent.py`.
- [ ] Technical agent evaluates momentum, volume anomaly, and RSI.
- [ ] Technical confidence computed via explicit rules (documented in a comment), not LLM-invented.
- [ ] Symbol validation implemented; invalid symbols handled without crashing.
- [ ] `sentiment_agent(symbol: str, simulate_failure: bool = False) -> dict` implemented in `backend/app/agents/sentiment_agent.py`.
- [ ] Sentiment agent produces POSITIVE / MIXED / NEGATIVE / UNAVAILABLE correctly.
- [ ] `simulate_failure=True` returns structured UNAVAILABLE output, no exception raised.
- [ ] Every agent output matches the exact contract in Section 5.
- [ ] No BUY/SELL language anywhere in outputs.
- [ ] Tests written and passing: normal cases, unusual volume, overbought RSI, missing symbols, simulate_failure.
- [ ] Did not touch `frontend/`, `backend/app/main.py`, orchestrator/synthesis files, RAG/portfolio files, or `main` branch.
- [ ] Any contract changes discussed with the team before pushing.
- [ ] All changes committed on `mem2` with the commit messages below.

---

## 9. Git Commands

```bash
# Make sure you're on your branch
git checkout mem2
git pull origin mem2

# Stage and commit in logical chunks

git add data/market_data.json
git commit -m "feat(data): add simulated stock market dataset"

git add backend/app/agents/technical_agent.py
git commit -m "feat(agents): implement technical analysis agent"

git add backend/app/agents/sentiment_agent.py data/news_data.json
git commit -m "feat(agents): implement sentiment and failure handling"

git add tests/test_market_agents.py
git commit -m "test(agents): add market agent tests"

# Push to your branch (never main)
git push origin mem2
```

If `mem2` doesn't exist on the remote yet:

```bash
git push -u origin mem2
```

---

**Remember:** this is a 4-hour build. Ship the deterministic, honest, well-labeled version — not a fancier one that fabricates data or crosses into another member's files.
