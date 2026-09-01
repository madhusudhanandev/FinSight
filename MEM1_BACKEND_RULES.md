# MEM1_BACKEND_RULES.md

## Project
**FinSight AI** — A Multi-Agent Autonomous Financial Intelligence System for Retail Investors.

## Member
**Member 1**

## Branch
`mem1` (created from `develop`)

## Role
Backend API, multi-agent orchestration and synthesis.

---

## 1. Owned Files and Directories

You own the following files/directories. Only you should modify these:

- `backend/app/main.py`
- `backend/app/api/`
- `backend/app/schemas/`
- `backend/app/services/orchestrator.py`
- `backend/app/services/synthesis.py`
- `backend/requirements.txt`
- `backend/README.md`

## 2. Do NOT Modify

- `frontend/`
- Data files owned by other members (`data/market_data.json`, `data/news_data.json`, `data/financial_documents.json`, `data/user_profiles.json`, `data/portfolios.json`)
- Other members' agent files (`technical_agent.py`, `sentiment_agent.py`, `fundamental_agent.py`, `portfolio_agent.py`, `retrieval.py`)
- Git configuration
- `main` branch (never push or merge directly into it)

If you need to change something outside your ownership, **coordinate with the owning member first.**

---

## 3. Pull-Before-Work Procedure

Always sync with `develop` before starting work:

```bash
git checkout develop
git pull origin develop
git checkout mem1
git merge develop
```

## 4. Saving Work (Commit Procedure)

```bash
git status
git add <specific-files>
git commit -m "type(scope): short description"
git push origin mem1
```

**Never use `git add .` without first checking `git status`.**
**Never force-push.**
**Never commit API keys, passwords, `.env` files, or private data.**

## 5. Commit Message Format

Use conventional commit types:

- `feat` – new feature
- `fix` – bug fix
- `docs` – documentation only
- `test` – adding or updating tests
- `refactor` – code change that doesn't add a feature or fix a bug
- `chore` – tooling/config/maintenance

Suggested commits for Member 1:

```text
feat(api): implement health check endpoint
feat(api): implement analyze endpoint
feat(schemas): define request and response models
feat(orchestrator): run agents concurrently with asyncio.gather
feat(synthesis): implement deterministic synthesis logic
fix(api): handle agent failure without crashing pipeline
docs(backend): update README with setup instructions
```

---

## 6. Required Backend Tasks

1. Build the FastAPI backend application.
2. Implement `GET /api/health`.
3. Implement `POST /api/analyze`.
4. Define Pydantic request and response schemas.
5. Run all specialized agents **concurrently** using `asyncio.gather()`.
6. Add CORS support for `http://localhost:5173`.
7. Implement deterministic synthesis logic (no randomness in final recommendation).
8. Handle conflicting agent outputs sensibly in synthesis.
9. Ensure execution **continues** when one agent fails — one failed agent must never crash the full analysis.
10. Record individual agent latency and total request latency.
11. Return data completeness percentage and source count.
12. Use **camelCase** field names in all responses (frontend expects this).
13. Validate `symbol`, `profile`, and `simulate_failure` inputs.
14. Return proper HTTP error responses (4xx/5xx as appropriate) for invalid input.
15. **Never** expose stack traces or secrets in any API response.

---

## 7. Request Contract

```json
{
  "symbol": "TCS",
  "profile": "conservative",
  "simulate_failure": false
}
```

## 8. Response Contract

The final result returned by `/api/analyze` must include:

- `company`
- `symbol`
- `price`
- `change`
- `recommendation`
- `confidence`
- `summary`
- `agents`
- `currentExposure`
- `projectedExposure`
- `concentration`
- `totalLatency`
- `dataCompleteness`
- `warning`

### Allowed `recommendation` values

- `CONSIDER`
- `WATCH`
- `AVOID`
- `INSUFFICIENT DATA`

---

## 9. Error Handling Rules

- Wrap each agent call so a single agent exception is caught and converted into a structured "unavailable"/failed status instead of propagating.
- Never let one failing agent take down the whole `/api/analyze` call.
- Return meaningful HTTP status codes for bad input (e.g. `400` for invalid symbol/profile).
- Never leak internal exception details, tracebacks, or environment/config values to the client.
- Do not expose any model chain-of-thought — only structured evidence and concise summaries.

---

## 10. Testing Requirements

Before merging, test:

- `/api/health` returns a healthy response.
- `/api/analyze` returns a valid, well-formed response.
- Conservative profile produces correct exposure/recommendation behavior.
- Aggressive profile produces correct exposure/recommendation behavior.
- Failed-agent scenario (`simulate_failure: true`) does not crash the pipeline and returns a graceful degraded result.
- Swagger/OpenAPI docs (`/docs`) load correctly and reflect the schemas.

---

## 11. Integration Checkpoints

- Coordinate with Member 2 and Member 3 on the exact shape of each agent's output before wiring orchestration.
- Confirm field names/casing with Member 4 before finalizing the response schema.
- Do not change the response contract during the final integration period without notifying the whole team.

## 12. Prohibited Changes

- No modifying frontend files.
- No modifying other members' data or agent files.
- No changes to Git configuration.
- No direct pushes or merges into `main`.
- No adding new features during the final integration window — stabilize only.

## 13. Handling Merge Conflicts

- Pull latest `develop` before resolving.
- Never overwrite another member's code to force a conflict resolution — talk to the file owner first.
- Resolve conflicts only within files you own; ask the owning member to resolve conflicts in their own files.

## 14. Documentation Requirements

- Keep `backend/README.md` updated with setup steps, run instructions, and endpoint descriptions.
- Document the request/response contract clearly for the other members.

## 15. Data and Financial Disclaimers

- Never claim simulated data is live data.
- Every financial result must include `"Not financial advice."` in the response.
- Every claim sourced via RAG must carry a visible source.
- If data is missing, mark it as unavailable — never invent values.

---

## Completion Checklist

- [ ] `/api/health` tested
- [ ] `/api/analyze` tested
- [ ] Conservative profile tested
- [ ] Aggressive profile tested
- [ ] Failed-agent scenario tested
- [ ] Swagger documentation checked
- [ ] No frontend files modified
- [ ] README updated
- [ ] Work committed and pushed to `mem1`

---

## Exact Git Commands (Member 1)

**Start of work:**

```bash
git checkout develop
git pull origin develop
git checkout mem1
git merge develop
```

**Saving work:**

```bash
git status
git add backend/app/main.py
git commit -m "feat(api): implement analysis endpoint"
git push origin mem1
```

**Opening a pull request:**

```text
mem1 → develop
```

Never merge `mem1` directly into `main`.
