# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **`AGENT.md` is the canonical operating document. Read it in full at the start of every session.** This file is the fast-orientation layer: the architecture big-picture and the constraints that bite, assembled so you don't have to read five documents to know what will get you in trouble. When this file and `AGENT.md`/the handoff disagree, they win.

---

## What this project is

Zili is a platform for presenting and sharing LLM-generated HTML artifacts — take the HTML output of Claude/ChatGPT/v0/etc. and render it pixel-perfect as a shareable deck or document. The product thesis is **render fidelity**; the hardest technical bet is the sandboxed renderer.

**Status: pre-implementation.** There is no code yet — only the planning package under `docs/` and the four startup files (`AGENT.md`, `SKILLS.md`, `LOOP.md`, this file). The repo is not yet scaffolded. Sprint 1 builds the render foundation. Do not invent code structure that contradicts §5 of the handoff.

## Start-of-session checklist (from AGENT.md)

1. `docs/zili-claude-code-handoff.md` — skim §3 (rules of engagement), §4 (locked decisions), §7 (build sequence).
2. `docs/sprints/sprint-N.md` — the current sprint brief, if one exists (only a template exists today).
3. `LOOP.md` — most recent 2 entries (sprint memory).
4. `SKILLS.md` — skim the SK-01…SK-15 index before reinventing any pattern.
5. `git status` / `git log` — orient (note: not currently a git repo).

## Where everything lives

| Need | Document |
|---|---|
| **Operating posture, principles, what you never do** | `AGENT.md` |
| **The contract: rules of engagement, locked decisions, repo layout, build sequence, conventions, quality gates** | `docs/zili-claude-code-handoff.md` |
| **Reusable project patterns (search before reinventing)** | `SKILLS.md` (SK-01…SK-15) |
| **Sprint-to-sprint memory** | `LOOP.md` |
| **Behaviour spec (BDD, authoritative for *what*)** | `docs/zili-requirements-gherkin-v0.2.md` |
| **Strategy, pricing, scope (*why*)** | `docs/zili-prd-v0.3.md` |
| **Visual source of truth (palette, type, components, anti-patterns)** | `docs/zili-brand.html` |
| **Mocks** | `docs/zili-marketing-site.html`, `zili-demo-states.html`, `zili-admin-mocks.html` |
| **Out-of-scope discoveries (append-only)** | `docs/discoveries.md` |

## Architecture big-picture

The pieces below span multiple documents; this is the shape you need in your head before reading code.

**Monorepo (pnpm workspaces), planned layout — see handoff §5 for the full tree:**
- `apps/web/` — Next.js 14+ App Router. Route groups: `(marketing)`, `(app)` (authed), `p/[slug]` (public SSR share), `_render/[artifact_id]` (sandbox iframe), `api/`, `og/`. Logic lives under `apps/web/lib/{db,storage,auth,stripe,analytics,ingest,render,utils}`; UI under `components/{ui,marketing,product,presenter,shared}`.
- `apps/worker/` — Cloudflare Worker, the asset proxy.
- `packages/brand-tokens/`, `packages/shared-types/`.
- `supabase/migrations/` — append-only SQL. `tests/` — Playwright e2e + visual-regression fixtures. `runbooks/` — incident docs.

**The renderer (highest-risk, the product's reason to exist).** Raw HTML in R2 at `artifacts/{user_id}/{artifact_id}.html` → served by `/_render/{artifact_id}` wrapped in a strict CSP → embedded in an iframe with `sandbox="allow-scripts"` and **never** `allow-same-origin` → external assets pass through the Cloudflare Worker at `/_assets/{encoded_url}`, gated by an `asset_allowlist` Postgres table the Worker reads (edge-cached, 5-min TTL). Any change here is fidelity- *and* security-critical: never weaken the sandbox, never wildcard the allow-list, run the visual-regression harness (8 reference artifacts, fails CI on >2% drift).

**Pricing state machine.** Accounts are exactly one of `free` / `grandfather_eligible` / `grandfather_locked` / `pro`. Transitions are driven by Stripe webhooks + a Postgres trigger — not by app code. The watermark and library cap are feature-flagged and gated on `plan_state`, not free booleans.

**The audit log is sacred.** Every operator/admin-equivalent action writes its `audit_log` row in the *same transaction* as the action, via a `SECURITY DEFINER` Postgres function (`app.action_*`, see SK-01). The log is append-only — no UPDATE/DELETE grants. No "log it later."

**Cross-cutting conventions worth knowing up front:**
- User-facing errors come from the central dictionary `lib/errors.ts` (code/title/body/suggestedAction) — never inline copy at the throw site (SK-04).
- Feature flags are typed constants resolved through PostHog (SK-03); analytics events are typed constants through a central wrapper (SK-05).
- TypeScript strict, no `any`; branded types for IDs; discriminated unions for state. Server Components by default. Migrations are additive-only.

## Commands (planned — repo is not yet scaffolded)

These are the intended commands per the handoff; **they do not work until Sprint 1 scaffolds the project.** Do not treat them as runnable today.

- `pnpm dev` — run the web app · `pnpm build` · `pnpm lint` (ESLint+Prettier) · `pnpm typecheck`
- `pnpm test` — Vitest (unit) · `pnpm test:e2e` — Playwright; visual regression is part of the Playwright suite and gates renderer changes
- `pnpm supabase db reset` — apply migrations locally (SK-09)
- `pnpm email:preview <EmailName>` — preview a React Email template (SK-07)

## Non-negotiables (the list that has bitten autonomous work before — AGENT.md + handoff §13)

- **Ask before:** adding any dependency, adding an external service, changing a locked decision (handoff §4), modifying an *existing* DB table (new tables are fine), CSP allow-list / iframe network changes, anything pricing/billing/paywall, deviating from the build sequence, writing user-visible marketing copy, or implementing anything the Gherkin marks "ambiguous." **Notify after:** finishing a task, fixing an unplanned bug, finding an edge case, or finding the artifacts contradict each other.
- **Never** weaken the renderer sandbox or skip visual regression on renderer changes.
- **Never** bypass the audit log; **never** catch-and-ignore errors (always Sentry).
- **Never** implement out-of-scope work — capture it in `docs/discoveries.md` (SK-15).
- Conventional commits, one concern each, referencing the sprint task ID (`feat(S2.4): …`).
- Don't write copy from imagination; pull from the brand canvas/mocks or ask. Brand judgement is the human's; mechanics are yours.

---

*This file front-loads orientation. `AGENT.md` is the source of truth — re-read it every session.*
