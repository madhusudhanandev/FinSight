# MEMBER4_RULES.md

**Project:** FinSight AI — A Multi-Agent Autonomous Financial Intelligence System for Retail Investors
**Member:** Member 4
**Branch:** `mem4`
**Owned Directory:** `/frontend-api/`
**Responsibility:** Frontend/API layer & final report rendering

> This file is your personal checklist. It does not replace `COMMON_RULES.md` — every rule in that file still applies to you. This just points the general rules at your specific work.

---

## 1. Your Branch

- [ ] You work **only** on `mem4`.
- [ ] `mem4` was created from `develop` — never from `main`.
- [ ] You never push to `main`.
- [ ] You never merge `mem4` into `main` yourself.
- [ ] Your work reaches `main` only via `mem4 → develop` (PR) → later `develop → main` (by the designated final-merge member).

---

## 2. Start-of-Session Routine

Run this **every time** before touching code:

```bash
git checkout develop
git pull origin develop
git checkout mem4
git merge develop
```

- [ ] Do this at the start of every session — not just once at hour 0.
- [ ] Resolve any conflicts immediately, before writing new frontend/API code.

---

## 3. What You Own — `/frontend-api/`

- [ ] All frontend UI code and the API layer that serves it live here.
- [ ] You are responsible for how other agents' outputs get **displayed** to the user — this includes disclaimers, source citations, and "unavailable" states.
- [ ] Do not edit other members' directories (`/data-agent/`, `/rag-agent/`, `/orchestrator/`) without informing them first.
- [ ] If you need something from another agent's output that isn't there, ask — don't fabricate a placeholder that looks real.

---

## 4. Commit Format (Your Scope)

```
type(frontend-api): short description
```

Examples:
```
feat(frontend-api): add report rendering view
fix(frontend-api): correct disclaimer placement on results page
docs(frontend-api): document API endpoints
```

Use: `feat`, `fix`, `docs`, `test`, `refactor`, `chore` — same as team standard.

---

## 5. Saving Work — Exact Commands

```bash
git status
git add <specific-files>
git commit -m "type(frontend-api): short description"
git push origin mem4
```

- [ ] Never `git add .` without reading `git status` output first.
- [ ] Never force-push.
- [ ] Double-check no `.env`, keys, or tokens are staged before every commit.

---

## 6. API Response Format — What You Must Render

Every response you consume from other agents follows this shape. Your UI must handle **all** of these fields, not just the happy path:

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

- [ ] `status: "error"` or `"partial"` → render a clear degraded-state message, not a crash or blank screen.
- [ ] `is_simulated: true` → visibly label that data as simulated in the UI. Never present it as live.
- [ ] `source` present → display it next to the claim. `source: null` on a RAG-based claim → treat as a bug, flag it, don't hide it.
- [ ] Missing/absent data → render **"unavailable,"** never a blank, zero, or guessed value.

---

## 7. Non-Negotiable UI Requirements

- [ ] **"Not financial advice."** must be visible on every screen/component that shows a financial result.
- [ ] Every RAG-derived claim shown to the user must display its source inline or via a visible citation.
- [ ] Never render internal chain-of-thought or raw model reasoning traces. Show only structured evidence + concise reasoning summaries the orchestrator provides for that purpose.
- [ ] If one agent fails, the rest of the report must still render — build your layout so one broken section doesn't take down the whole page.

---

## 8. Testing Requirements

- [ ] Test your UI against all three response states: `success`, `partial`, `error`.
- [ ] Test with `is_simulated: true` and confirm the label actually shows.
- [ ] Test with a missing `source` field and confirm it's flagged, not silently dropped.
- [ ] Smoke-test the full page render before opening any PR.

---

## 9. Pull-Request Checklist (Before You Open a PR)

- [ ] `git status` clean, only intended files staged.
- [ ] No secrets, keys, or `.env` files in the diff.
- [ ] Disclaimer and source-citation rendering verified manually.
- [ ] PR title: `type(frontend-api): short description`.
- [ ] PR description states what changed, what was tested, and any known gaps.
- [ ] Target branch is `develop`, never `main`.

---

## 10. Integration Checkpoints (Your Angle)

- [ ] **Hour 1:** Skeleton UI + API scaffold pushed, unblocked.
- [ ] **Hour 2:** First working render of at least one agent's output, PR'd to `develop`.
- [ ] **Hour 3:** Full report view wired to all agents via `develop`; test degraded states.
- [ ] **Hour 3:30 (feature freeze):** No new UI features — only bugfixes, polish, and disclaimer/citation correctness.
- [ ] **Hour 4:** Final check that `main` (post-merge) renders cleanly end-to-end.

---

## 11. Prohibited for You

- [ ] No pushing to `main`.
- [ ] No force-push.
- [ ] No committing secrets or `.env` files.
- [ ] No deleting other members' files.
- [ ] No editing `/data-agent/`, `/rag-agent/`, or `/orchestrator/` without telling that owner first.
- [ ] No labeling simulated data as live, anywhere in the UI copy.
- [ ] No hiding or suppressing error/partial states to make the demo "look cleaner" — show them honestly.
- [ ] No new features after feature freeze.

---

## Quick Reference

**Start:**
```bash
git checkout develop
git pull origin develop
git checkout mem4
git merge develop
```

**Save:**
```bash
git status
git add <specific-files>
git commit -m "type(frontend-api): short description"
git push origin mem4
```

**Never:** `git add .` blindly, force-push, commit secrets, hide a broken agent's failure state.
