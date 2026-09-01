# COMMON_RULES.md

**Project:** FinSight AI — A Multi-Agent Autonomous Financial Intelligence System for Retail Investors
**Time Limit:** 4 hours
**Team Size:** 4 members

These rules are strict and non-negotiable for the duration of the hackathon. Everyone reads this before writing a single line of code.

---

## 0. Branch Structure

```
main
└── develop
    ├── mem1
    ├── mem2
    ├── mem3
    └── mem4
```

| Branch | Purpose |
|---|---|
| `main` | Final stable submission ONLY. Never touched directly. |
| `develop` | Integration branch. All merges land here first. |
| `mem1`–`mem4` | Personal work branches, created from `develop`. |

---

## 1. Git Branch Usage

- [ ] Work **only** on your assigned `memX` branch.
- [ ] `memX` branches must be created **from `develop`**, never from `main`.
- [ ] Never push directly to `main`.
- [ ] Never merge your own branch into `main`.
- [ ] Only `develop → main` merges happen, and only after testing.
- [ ] All feature merges go: `memX → develop` via Pull Request.

---

## 2. Pull-Before-Work Procedure

Run this **every time** before starting work, no exceptions:

```bash
git checkout develop
git pull origin develop
git checkout memX
git merge develop
```

- [ ] Do this at the start of every work session, not just once.
- [ ] Resolve any conflicts from this merge **before** writing new code.

---

## 3. Commit-Message Format

Use **Conventional Commits**:

```
type(scope): short description
```

**Allowed types:**

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding/fixing tests |
| `refactor` | Code change, no behavior change |
| `chore` | Tooling, config, cleanup |

**Examples:**
```
feat(agent-news): add news-sentiment agent
fix(rag): correct source citation formatting
docs(readme): add setup instructions
```

- [ ] Scope = the module/directory you touched (see ownership table).
- [ ] Description in imperative mood, lowercase, no trailing period.

---

## 4. Saving Work — Exact Commands

```bash
git status
git add <specific-files>
git commit -m "type(scope): short description"
git push origin memX
```

- [ ] **Never** run `git add .` without first running `git status` and reviewing the output.
- [ ] Add files by name — only what you intended to change.
- [ ] Never force-push (`git push -f` / `--force`) under any circumstances.

---

## 5. Pull-Request Procedure

- [ ] PR direction is always `memX → develop`.
- [ ] PR title follows commit format: `type(scope): short description`.
- [ ] PR description must state: what changed, what was tested, any known issues.
- [ ] At least one other member reviews/skims before merge (fast, informal is fine — but not skipped).
- [ ] No self-merge into `main`, ever, under any deadline pressure.
- [ ] `develop → main` merge happens only once, at final submission, after testing.

---

## 6. Code Ownership

| Member | Branch | Responsibility | Owned Directory |
|---|---|---|---|
| Member 1 | `mem1` | Data ingestion & market data pipeline | `/data-agent/` |
| Member 2 | `mem2` | News/RAG & sentiment analysis agent | `/rag-agent/` |
| Member 3 | `mem3` | Multi-agent orchestration & reasoning engine | `/orchestrator/` |
| Member 4 | `mem4` | Frontend/API layer & final report rendering | `/frontend-api/` |

*(Adjust names/directories to match actual assignments before starting — keep this table updated.)*

- [ ] Never delete another member's files.
- [ ] Never modify another member's owned section without informing them first (message in team chat minimum).
- [ ] Shared/common code lives in `/common/` — coordinate before editing.

---

## 7. File Naming

- [ ] Lowercase, hyphen-separated: `news-sentiment-agent.py`, not `NewsSentimentAgent.py`.
- [ ] Test files: `test_<module_name>.py`.
- [ ] No spaces, no special characters in filenames.
- [ ] No duplicate/backup files like `agent_final_v2_REAL.py` — use git history instead.

---

## 8. API Response Format

All agent/API responses must follow a consistent structure:

```json
{
  "status": "success | partial | error",
  "data": { },
  "source": "string or null",
  "is_simulated": true,
  "disclaimer": "Not financial advice.",
  "error": null
}
```

- [ ] `is_simulated` must be accurate — **never mark simulated data as live**.
- [ ] `source` is required whenever data or a claim comes from RAG/retrieval.
- [ ] Missing data fields → `"unavailable"`, never fabricated values.

---

## 9. Error Handling

- [ ] Every agent call is wrapped in try/except (or equivalent).
- [ ] One failed agent **must not** crash the full analysis pipeline — fail gracefully, return `"status": "partial"` or `"error"` for that agent only.
- [ ] Log errors with enough context to debug (agent name, timestamp, input).
- [ ] Never let an unhandled exception reach the end user's screen.
- [ ] Fallback response must still include the "Not financial advice." disclaimer.

---

## 10. Testing Requirements

- [ ] Every new function/agent gets at least one basic test before PR.
- [ ] Test the failure path, not just the happy path (what happens when an agent times out or returns nothing).
- [ ] Manually smoke-test your feature on your own branch before opening a PR.
- [ ] No PR merges into `develop` with known-broken functionality — flag it clearly in the PR if partial.

---

## 11. Integration Checkpoints

Suggested checkpoints across the 4-hour window (adjust times as needed):

- [ ] **Hour 1 mark:** Branches set up, skeleton code pushed, everyone unblocked.
- [ ] **Hour 2 mark:** First `memX → develop` PRs merged; early integration test.
- [ ] **Hour 3 mark:** All core features merged into `develop`; full pipeline test.
- [ ] **Hour 3:30 mark:** Feature freeze (see Section 15) — bugfixes only.
- [ ] **Hour 4 mark:** `develop → main` final merge, submission.

---

## 12. Prohibited Changes

- [ ] No pushing directly to `main`.
- [ ] No force-pushing to any shared branch (`develop`, `main`, or others' `memX`).
- [ ] No committing API keys, passwords, `.env` files, tokens, or private/personal data — check `git status` and diffs before every commit.
- [ ] No deleting another member's files or branches.
- [ ] No editing another member's owned section without informing them.
- [ ] No claiming simulated/mock data is live data, anywhere in code, UI, or docs.
- [ ] No new features once feature freeze starts (Section 15).

---

## 13. Handling Merge Conflicts

- [ ] Pull latest `develop` into your `memX` branch **before** starting work (Section 2) to minimize conflicts.
- [ ] If a conflict occurs, the member who owns that file/section resolves it — do not blindly accept "theirs" or "ours."
- [ ] Never resolve a conflict by deleting the other person's code without checking with them first.
- [ ] After resolving, re-test the affected feature before pushing.
- [ ] If unsure how to resolve, flag it in team chat immediately — don't sit on a broken branch.

---

## 14. Documentation Requirements

- [ ] Every module has a short docstring/comment block: purpose, inputs, outputs.
- [ ] README updated with setup + run instructions before final submission.
- [ ] Any known limitations or unfinished pieces must be documented, not hidden.
- [ ] API endpoints documented (even briefly): method, path, expected input/output.

---

## 15. Data & Financial Disclaimers (Non-Negotiable)

- [ ] Every financial result/output displayed to the user must show **"Not financial advice."**
- [ ] Every RAG-based claim must include a **source** — no unsourced claims presented as fact.
- [ ] If data is missing, display it as **"unavailable"** — never invent or estimate silently.
- [ ] Never present simulated/mock/sample data as live/real data, in code, logs, or UI.
- [ ] Do **not** expose private model chain-of-thought/internal reasoning traces to the user.
- [ ] Instead, show **structured evidence and concise reasoning** (e.g., "Signal: X, based on source Y").
- [ ] One agent's failure must degrade gracefully, not silently corrupt or fabricate downstream results.

---

## 16. Final Submission Procedure

- [ ] **Feature freeze** starts at the agreed checkpoint (see Section 11) — stop adding features, bugfixes and polish only.
- [ ] Final integration test run on `develop` with all four members' work merged.
- [ ] Confirm: no API keys/secrets in the repo, all disclaimers present, error handling verified.
- [ ] One designated member performs the final `develop → main` merge (not a self-merge of anyone's `memX`).
- [ ] Tag or note the final commit on `main` as the submission version.
- [ ] Do a final read-through of `main` before submitting — no last-minute untested pushes.

---

## Quick Reference — Commands

**Start work:**
```bash
git checkout develop
git pull origin develop
git checkout memX
git merge develop
```

**Save work:**
```bash
git status
git add <specific-files>
git commit -m "type(scope): short description"
git push origin memX
```

**Never:**
```bash
git add .              # without checking git status first
git push --force        # ever
```

---

*Stick to this. Four hours is not enough time to recover from a broken `main` branch.*
