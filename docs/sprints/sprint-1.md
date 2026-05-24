# Sprint 1 handoff — Render foundation

> **Canonical source: `docs/zili-sprint-plan.html` → "01 · Sprint — Render foundation".** This brief mirrors that card; if the two ever disagree, the sprint plan wins. The sprint plan is the source of truth for the scope, tasks, points, and demo of *every* sprint — read the relevant card there before starting any sprint.

**Dates:** Week 1–2 (fill in actual start → end)
**Points:** ~28
**Risk this sprint resolves:** Rendering fidelity is the entire product thesis. If S1 can't prove it works, the whole roadmap dies. Better to find out in week 2 than week 22.

---

## Goal

Prove that a single HTML file can be uploaded, stored, and rendered in a sandboxed iframe with full visual fidelity. No auth, no UI polish, no sharing — just: does the hardest technical bet work?

## Required reading

- **Sprint card:** `docs/zili-sprint-plan.html` — Sprint 1 (Render foundation). Canonical.
- **Contract:** `docs/zili-claude-code-handoff.md` — §4 (renderer architecture), §5 (repo structure), §6 (conventions), §7 Sprint 1 build sequence.
- **Gherkin features in scope:** Feature 2 (Artifact upload), Feature 3 (Artifact rendering & mode detection) in `docs/zili-requirements-gherkin-v0.2.md`.
- **Brand canvas:** `docs/zili-brand.html` — for token reference, even though UI is minimal this sprint.
- Previous sprint demo: N/A (first sprint).

## Tasks (from sprint plan)

- [ ] S1.1 — Repo, Next.js scaffold, deploy to Vercel, custom domain wired — 3 pts
- [ ] S1.2 — Supabase project, schema for users + artifacts (minimal) — 3 pts
- [ ] S1.3 — R2 bucket, signed-upload pipeline, file upload to storage — 4 pts
- [ ] S1.4 — Sandboxed iframe renderer with strict CSP (no `allow-same-origin`) — 5 pts
- [ ] S1.5 — Asset proxy worker for Tailwind CDN, Google Fonts, common CDNs — 5 pts
- [ ] S1.6 — Visual-regression test harness (Playwright + screenshot diffs) — 5 pts
- [ ] S1.7 — Seed 8 reference artifacts (Claude, ChatGPT, v0, Lovable, Bolt) for QA — 3 pts

**Total:** ~28 points

## Definition of done

- I can curl-POST an HTML file to `/api/upload` and get back a URL.
- Visiting that URL renders the artifact pixel-perfect for at least **7 of 8** reference artifacts.
- External assets from the allow-list load. Anything else is blocked by CSP.
- Visual-diff harness flags **>2% pixel difference** vs. native browser render.

## Build order (handoff §7)

1. Repo scaffold, monorepo (pnpm workspaces), TypeScript config, ESLint+Prettier → 2. Tailwind config with brand-canvas tokens → 3. Supabase project + initial migration (users + artifacts) → 4. R2 bucket + signed upload endpoint → 5. Sandboxed iframe renderer route (`_render/[artifact_id]`) → 6. Asset proxy Cloudflare Worker → 7. CSP header builder + `asset_allowlist` table → 8. Visual regression harness (Playwright + 8 reference artifacts).

## Open questions for human

**Resolved:**
- **Repo / branch:** `https://github.com/getmobilehq/zili`, default branch `main`. Feature work on `feat/S1.x-*` branches, conventional commits referencing the task ID (`feat(S1.4): …`) per handoff §6. *(Confirm branch-naming preference if different.)*

**Still open — needed before the affected task starts:**
- Which **8 reference artifacts** for the visual-regression harness (S1.6/S1.7)? Which LLMs, which artifact types, which complexity levels. *Blocks S1.6/S1.7.*
- Do **Sentry, PostHog, Resend** accounts exist, or set up now? *(Sentry is the only one that matters for S1; PostHog/Resend not used until later sprints.)*
- **Cloudflare R2 + Workers** account ready? *Blocks S1.3/S1.5.*
- **Supabase** project name / org? *Blocks S1.2.*
- **Vercel** project name? *Blocks S1.1.*
- Is the **custom domain** (`zili.xyz`) registered and DNS-accessible for S1.1?

## Locked decisions this sprint

- Stack per handoff §4 (Next.js 14+, Supabase, R2, Cloudflare Workers, TypeScript strict, Tailwind, pnpm).
- Repo structure per handoff §5.
- Renderer architecture per handoff §4: iframe `sandbox="allow-scripts"`, **never** `allow-same-origin`; assets only through the Worker proxy + `asset_allowlist`.

## First action

Per AGENT.md and handoff §13: **propose the first 3 commits** (in order, with conventional commit messages) and wait for human approval before writing code.

## Demo target — Friday of week 2

Five reference artifacts rendering side-by-side — Zili's render vs. the original browser. If they don't match, we don't ship S2 until they do.
