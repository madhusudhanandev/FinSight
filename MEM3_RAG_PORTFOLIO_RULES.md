# MEM3 — RAG & Portfolio Development Rules

**Project:** FinSight AI — Multi-Agent Autonomous Financial Intelligence System for Retail Investors
**Member:** Member 3
**Branch:** `mem3`
**Role:** Financial-document retrieval, Fundamental Agent, user profiles, Portfolio Risk Agent

These rules are **strict and mandatory**. Any pull request that violates them must be rejected in review.

---

## 1. Ownership Boundaries

### 1.1 Owned files (Member 3 may create/modify ONLY these)
```
backend/app/agents/fundamental_agent.py
backend/app/agents/portfolio_agent.py
backend/app/services/retrieval.py
data/financial_documents.json
data/user_profiles.json
data/portfolios.json
tests/test_rag_portfolio.py
```

### 1.2 Do NOT modify (hard prohibition)
```
frontend/
backend/app/main.py
technical agent files
sentiment agent files
orchestration files (orchestrator/router/agent-coordinator)
main branch (never commit or push directly to main)
```

If a change appears necessary outside owned files, **stop and raise it with the team** instead of editing it directly.

---

## 2. Financial Document Corpus

1. Build a small, self-contained corpus covering exactly three symbols:
   - `TCS`
   - `RELIANCE`
   - `INFY`
2. Store the corpus in `data/financial_documents.json`.
3. **Every chunk must contain all six fields** — no exceptions:

| Field     | Type   | Description                                  |
|-----------|--------|-----------------------------------------------|
| `id`      | string | Unique chunk identifier                       |
| `symbol`  | string | `TCS` \| `RELIANCE` \| `INFY`                 |
| `content` | string | The actual text chunk                         |
| `source`  | string | Document/filing name or type                  |
| `page`    | int    | Page number within the source document        |
| `date`    | string | Document date (`YYYY-MM-DD`)                  |

4. Because a real filings pipeline is out of scope for this project phase, documents are **synthetic/demo data**. Every synthetic document **must be clearly labeled**, e.g.:
   ```json
   {
     "id": "tcs-annual-2024-001",
     "symbol": "TCS",
     "content": "TCS reported a 12% YoY growth in digital revenue... [DEMO DOCUMENT — SYNTHETIC DATA FOR PORTFOLIO DEMO PURPOSES]",
     "source": "Demo Annual Report FY2024",
     "page": 4,
     "date": "2024-04-15"
   }
   ```
   The label may live in `content`, a dedicated `"is_demo": true` field, or both — but it must be **visible in agent output**, never hidden.

---

## 3. Retrieval Service (`backend/app/services/retrieval.py`)

1. Implement:
   ```python
   def retrieve_documents(symbol: str, query: str) -> list:
       ...
   ```
2. Retrieval must be **lightweight only**. Allowed approaches:
   - Keyword / substring matching, or
   - TF-IDF + cosine similarity (e.g. `sklearn.feature_extraction.text.TfidfVectorizer`)
3. **Prohibited:** building or introducing a vector database, embedding service, ANN index (FAISS/Pinecone/Chroma/etc.), or any infrastructure beyond an in-memory/lightweight approach. This is a portfolio project — complexity must stay proportional to scope.
4. Retrieval must filter by `symbol` first, then rank remaining chunks by relevance to `query`.
5. Return an empty list (not an exception) when no relevant document exists — the calling agent must handle this gracefully.

---

## 4. Fundamental Agent (`backend/app/agents/fundamental_agent.py`)

1. Implement:
   ```python
   async def fundamental_agent(symbol: str) -> dict:
       ...
   ```
2. **The agent must only make claims that are directly supported by retrieved document chunks.** No claim may be invented, extrapolated, or sourced from general model knowledge.
3. Every fundamental claim in the output must carry a **visible source and page number** traceable back to `retrieve_documents`.
4. If no supporting document exists for a symbol, the agent must say so explicitly (e.g. low confidence / "insufficient data") rather than fabricate content.

---

## 5. User Profiles (`data/user_profiles.json`)

1. Create at minimum two profiles:
   - `conservative`
   - `aggressive`
2. Each profile must store:

| Field                | Description                                  |
|----------------------|-----------------------------------------------|
| `risk_tolerance`     | e.g. `"low"` / `"high"`                       |
| `max_sector_exposure`| Max % of portfolio in a single sector         |
| `investment_horizon` | e.g. `"short-term"` / `"long-term"`           |
| `max_volatility`     | Numeric volatility ceiling                    |

Example:
```json
{
  "conservative": {
    "risk_tolerance": "low",
    "max_sector_exposure": 20,
    "investment_horizon": "long-term",
    "max_volatility": 0.15
  },
  "aggressive": {
    "risk_tolerance": "high",
    "max_sector_exposure": 45,
    "investment_horizon": "short-term",
    "max_volatility": 0.35
  }
}
```

---

## 6. Sample Portfolios (`data/portfolios.json`)

1. Create sample holdings per symbol (e.g. current sector allocation, existing position size) sufficient to compute exposure calculations for TCS, RELIANCE, and INFY.
2. Data must be internally consistent — sector labels here must match sector labels used by the Portfolio Agent's exposure logic.

---

## 7. Portfolio Risk Agent (`backend/app/agents/portfolio_agent.py`)

1. Implement:
   ```python
   async def portfolio_agent(
       symbol: str,
       profile: str,
       investment_percentage: float = 14
   ) -> dict:
       ...
   ```
2. The agent must calculate and return:
   - **Current sector exposure** — from existing portfolio data
   - **Projected sector exposure** — current exposure + proposed `investment_percentage`
   - **Profile exposure limit** — pulled from the selected profile's `max_sector_exposure`
   - **Concentration status** — e.g. `"within_limit"` / `"over_limit"`
   - **Suitability warning** — human-readable flag when projected exposure breaches the profile's limit or volatility ceiling
3. **Mandatory proof of personalization:** given the *same* `symbol` and *same* `investment_percentage`, calling `portfolio_agent` with `profile="conservative"` vs `profile="aggressive"` must produce **different** `concentration` / `suitability warning` results whenever the projected exposure sits between the two profiles' limits. This must be demonstrated in tests (see §9).

---

## 8. Shared Output Contract

Every agent (`fundamental_agent`, `portfolio_agent`) must return a dict following the **shared structured format** used across all agents in the system:

```json
{
  "name": "string",
  "status": "string",
  "signal": "string",
  "confidence": "number",
  "summary": "string",
  "evidence": ["string", "..."],
  "source": "string",
  "latency": "number"
}
```

`portfolio_agent` must additionally include:

```json
{
  "currentExposure": "number",
  "projectedExposure": "number",
  "concentration": "string"
}
```

Do not rename, remove, or restructure any of these keys — this is the **global API contract** shared with other agents and the orchestration layer.

---

## 9. Testing (`tests/test_rag_portfolio.py`)

Tests must verify, at minimum:

1. `retrieve_documents` returns only chunks matching the requested `symbol`.
2. `retrieve_documents` returns relevant chunks for a query and an empty list for an irrelevant one.
3. Every chunk in `financial_documents.json` has all six required fields.
4. `fundamental_agent` output includes `source` and `page` for every claim in `evidence`.
5. `fundamental_agent` output conforms to the shared structured format (§8).
6. `portfolio_agent` output includes `currentExposure`, `projectedExposure`, and `concentration` in addition to the shared fields.
7. **Personalization proof:** identical `symbol` + identical `investment_percentage`, run once with `profile="conservative"` and once with `profile="aggressive"`, produce different `concentration` and/or suitability outcomes.
8. No test or fixture reaches into files outside the owned-files list.

---

## 10. Prohibited Actions

Member 3 must **never**:

- Make an uncited financial claim (any claim without a traceable `source` + `page`).
- Fabricate filing information, figures, or dates not present in `financial_documents.json`.
- Present output as a direct investment guarantee or promise of returns (e.g. "this will make you money"). Output must remain informational/advisory in tone.
- Modify the global agent output API contract defined in §8.
- Build a vector database or any retrieval infrastructure heavier than keyword/TF-IDF matching.
- Modify any file outside the owned-files list, including other members' agent files, `main.py`, frontend code, or orchestration logic.
- Commit or push directly to `main`.

---

## 11. Completion Checklist

- [ ] `data/financial_documents.json` created with TCS, RELIANCE, INFY chunks
- [ ] Every chunk has `id`, `symbol`, `content`, `source`, `page`, `date`
- [ ] Synthetic/demo documents clearly labeled as demo data
- [ ] `retrieve_documents(symbol, query) -> list` implemented in `retrieval.py`
- [ ] Retrieval uses only keyword matching or TF-IDF/cosine similarity
- [ ] `async def fundamental_agent(symbol) -> dict` implemented
- [ ] All fundamental claims cite `source` + `page` from retrieved docs
- [ ] `data/user_profiles.json` created with `conservative` and `aggressive` profiles
- [ ] Each profile has `risk_tolerance`, `max_sector_exposure`, `investment_horizon`, `max_volatility`
- [ ] `data/portfolios.json` created with sample holdings
- [ ] `async def portfolio_agent(symbol, profile, investment_percentage=14) -> dict` implemented
- [ ] Portfolio agent returns current exposure, projected exposure, limit, concentration status, suitability warning
- [ ] Same stock data proven to yield different results for conservative vs aggressive profiles
- [ ] All agent outputs follow shared format (`name`, `status`, `signal`, `confidence`, `summary`, `evidence`, `source`, `latency`)
- [ ] Portfolio agent outputs additionally include `currentExposure`, `projectedExposure`, `concentration`
- [ ] `tests/test_rag_portfolio.py` written and passing
- [ ] No files outside owned list touched
- [ ] All commits made on `mem3` branch only

---

## 12. Git Workflow for `mem3`

```bash
# 1. Create and switch to the branch (from up-to-date main)
git checkout main
git pull origin main
git checkout -b mem3

# 2. Stage and commit retrieval work
git add data/financial_documents.json backend/app/services/retrieval.py
git commit -m "feat(rag): add financial document retrieval"

# 3. Stage and commit the fundamental agent
git add backend/app/agents/fundamental_agent.py
git commit -m "feat(agents): implement fundamental filing agent"

# 4. Stage and commit profiles and portfolios
git add data/user_profiles.json data/portfolios.json
git commit -m "feat(profile): add investor profiles and portfolios"

# 5. Stage and commit the portfolio risk agent
git add backend/app/agents/portfolio_agent.py
git commit -m "feat(agents): implement portfolio risk analysis"

# 6. Stage and commit tests
git add tests/test_rag_portfolio.py
git commit -m "test(rag): verify citations and personalization"

# 7. Push branch
git push origin mem3

# 8. Open a PR from mem3 -> main for review
#    Do NOT merge directly into main.
```

---

## 13. Review Gate

A PR from `mem3` may only be merged once:

1. All items in the §11 checklist are complete.
2. All tests in `tests/test_rag_portfolio.py` pass.
3. A reviewer confirms no files outside §1.1 were touched (`git diff main...mem3 --stat`).
4. A reviewer confirms the shared output contract (§8) is unchanged.
