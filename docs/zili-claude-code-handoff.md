# Zili — Claude Code implementation handoff brief

**Version** v0.1 · May 2026
**Audience** Claude Code, working autonomously with periodic human review
**Purpose** Give Claude Code enough context and explicit decisions to implement Zili V1 over 12 fortnights without re-litigating settled questions

---

## Table of contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Required reading — the input artifacts](#2-required-reading--the-input-artifacts)
3. [The rules of engagement](#3-the-rules-of-engagement)
4. [Locked architectural decisions](#4-locked-architectural-decisions)
5. [Repository structure](#5-repository-structure)
6. [Coding conventions](#6-coding-conventions)
7. [Build sequence — dependency-ordered](#7-build-sequence--dependency-ordered)
8. [Database schema overview](#8-database-schema-overview)
9. [The first-session script](#9-the-first-session-script)
10. [Per-sprint handoff format](#10-per-sprint-handoff-format)
11. [Quality gates](#11-quality-gates)
12. [What human review is for](#12-what-human-review-is-for)
13. [Common pitfalls — what not to do](#13-common-pitfalls--what-not-to-do)

---

## 1. How to use this document

This document is the **contract** between the human operator and Claude Code. It is not a tutorial, not a primer, and not exhaustive — it is a focused brief that establishes:

- What's already decided (don't re-debate)
- What Claude Code is empowered to decide alone
- What requires explicit human approval
- Where to find every other piece of context

**For each sprint**, the human operator will provide a Sprint Brief (template in §10). Claude Code reads:

1. This document (the contract)
2. The Sprint Brief (specific to the sprint)
3. The Gherkin requirements for the relevant features
4. Whatever artifacts the Sprint Brief points to (mocks, journey map, etc.)

…then proceeds to implementation, asking questions only when the explicit "ask the human" criteria in §3 are met.

**This document is versioned.** When something changes — a tech choice, a convention, a pricing decision — update this document first. Then notify Claude Code in the next sprint brief.

---

## 2. Required reading — the input artifacts

Claude Code should read all of these once at the start of the project, and re-reference per sprint as relevant. They live in the project directory.

| Artifact | What it tells you | When to read |
|---|---|---|
| `zili-prd-v0.3.md` | Strategy, target users, locked decisions, success metrics | Once at project start. Re-read before any sprint that touches positioning, pricing, or scope. |
| `zili-requirements-gherkin-v0.2.md` | V1 feature requirements in BDD format. Authoritative for behaviour. | Per-sprint — read the features in scope before writing any code for them. |
| `zili-brand.html` | Brand canvas — palette, typography, spacing, components, anti-patterns | Once at project start. Re-reference any time UI is involved. |
| `zili-journey-map.html` | Per-stakeholder journey deep-dive | Reference for understanding *why* a feature matters in context. |
| `zili-swimlane.html` | Cross-stakeholder swimlane — handoffs and conversion loops | Reference for understanding how features connect across user categories. |
| `zili-sprint-plan.html` | 12-sprint plan with tasks, points, DoD, demos | Read the relevant sprint card before implementing it. |
| `zili-marketing-site.html` | Homepage design — sections, copy, structure | Reference for Sprint 5 (marketing site). |
| `zili-demo-states.html` | Post-drop demo flow — loading, success, save, dismissed, error | Reference for Sprint 5 (live demo flow). |
| `zili-admin-mocks.html` | Admin surfaces — dashboard, user detail, moderation, audit log | Reference for Sprint 8 (admin baseline) and Sprint 11 (runbooks, DMCA flow). |
| `zili-validation-script.md` | User research playbook | Reference only — Claude Code does not need to engage with this. |

---

## 3. The rules of engagement

Claude Code is empowered to make most implementation decisions independently. The exceptions are listed below — these are the only times Claude Code should pause and ask the human.

### Claude Code DOES decide alone:

- File and folder names (within the conventions in §6)
- Internal function and variable names
- Implementation patterns (loops, conditionals, error handling) within the conventions
- Library choices for *internal* utilities (e.g. which date library, which validation library) when the choice is low-risk
- Inline copy for error messages and success messages within an existing tone (use brand canvas + existing copy as reference)
- Test cases for any non-trivial code Claude Code writes
- Refactoring small sections of code for clarity, as long as the public interface is unchanged

### Claude Code MUST ask the human BEFORE:

- Adding a new top-level dependency (anything that goes in `package.json`)
- Adding a new external service (a new SaaS, a new hosted service)
- Changing any architectural decision in §4
- Changing the database schema for an existing table (adding a new table is fine; modifying an existing one needs review)
- Implementing anything that is described as "ambiguous" in the Gherkin
- Implementing user-visible copy beyond simple system messages (marketing copy, headers, prompts requiring brand judgment)
- Adding any external network call from the renderer iframe (CSP allow-list changes)
- Making any decision that affects pricing, billing, or paywalls
- Deviating from a step in the build sequence (§7) without first proposing an alternative

### Claude Code MUST notify the human AFTER (but doesn't need approval first):

- Completing each task in the Sprint Brief
- Encountering and fixing a bug that wasn't in the Sprint Brief
- Discovering an undocumented edge case
- Finding that an existing artifact (PRD, Gherkin, mocks) is internally inconsistent

### When in doubt, ask.

Asking is cheap. Re-doing work because of a wrong assumption is expensive. If a decision feels like it could be a strategic one, it probably is. Ask.

---

## 4. Locked architectural decisions

These are decided. Do not re-litigate.

| Decision | Locked answer | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SSR for shared links, edge runtime for OG cards |
| Hosting | Vercel | Zero-config edge, faster ship velocity |
| Database | Supabase (Postgres) | Postgres + auth + storage in one |
| Auth | Supabase Auth | Bundled with DB, Google OAuth + email |
| Object storage | Cloudflare R2 | S3-compatible, no egress fees |
| Renderer | Sandboxed iframe with strict CSP | Required for security |
| Asset proxy | Cloudflare Workers | For asset allow-list, CSP injection, edge caching |
| Payments | Stripe + Stripe Billing | Industry default |
| Analytics | PostHog | Funnels, cohorts, feature flags |
| Error monitoring | Sentry | Free for solo, source-map upload |
| Admin UI | Retool | Wired to Postgres + Stripe — no custom admin in V1 |
| Email | Resend | React Email components |
| Styling | Tailwind CSS | Co-located with components |
| Language | TypeScript | Strict mode |
| Package manager | pnpm | Faster, more disciplined than npm |
| Testing | Vitest (unit) + Playwright (e2e) | Modern, fast, reliable |
| Linting | ESLint + Prettier | Standard config, no bikeshedding |

### Renderer architecture (decided)

The HTML renderer is the highest-risk component. Architecture:

1. **Storage** — Raw HTML lives in R2 at `artifacts/{user_id}/{artifact_id}.html`
2. **Render route** — `/_render/{artifact_id}` returns the HTML wrapped with strict CSP headers
3. **Asset proxy** — Cloudflare Worker at `/_assets/{encoded_url}` proxies allow-listed external assets (Tailwind CDN, Google Fonts, common CDNs)
4. **iframe** — Frontend embeds `/_render/{artifact_id}` with `sandbox="allow-scripts"` and NO `allow-same-origin`
5. **CSP** — `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' https://_assets/*; style-src 'unsafe-inline' https://_assets/*; img-src data: https://_assets/*; font-src https://_assets/*; connect-src 'none';`
6. **Asset allow-list** — Maintained in a Postgres table, read by the Worker on each request, cached at the edge

### Pricing state machine (decided)

User accounts exist in one of four billing states:

1. `free` — Default. Subject to watermark and library cap (post-promo only).
2. `grandfather_eligible` — Signed up during launch window (LAUNCH_DATE to LAUNCH_DATE+90). Treated as Free but flagged for the 50%-for-life offer.
3. `grandfather_locked` — Upgraded to Pro during the grandfather window (LAUNCH_DATE+90 to LAUNCH_DATE+120). Pays $6/month for life.
4. `pro` — Standard Pro. Pays $12/month or $108/year.

Transitions are managed by Stripe webhooks + a Postgres trigger.

### Slug format (decided)

Share slugs are `{3-char hash}-{slugified-title}` (e.g., `qx7-quarterly-strategy`).
- Hash is base36, generated from artifact_id + random salt
- Title is slugified (lowercase, hyphens, max 60 chars)
- Pro users can replace the slug with a custom one (alphanumeric + hyphens, 3–60 chars, must be unique)

### Demo flow (decided)

The demo flow on the homepage uses temporary storage:
- Upload creates a cookie-based session (24h expiry)
- Artifact stored in R2 at `demo/{session_token}/{artifact_id}.html`
- After 24h: cookie expires; after 25h: R2 object purged
- If user signs up within 24h: ownership transfers from session to user

---

## 5. Repository structure

```
zili/
├── apps/
│   ├── web/                          # Next.js app (the main product + marketing)
│   │   ├── app/
│   │   │   ├── (marketing)/          # Marketing site routes (homepage, pricing, etc.)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pricing/
│   │   │   │   ├── examples/
│   │   │   │   └── layout.tsx
│   │   │   ├── (app)/                # Authenticated product routes
│   │   │   │   ├── library/
│   │   │   │   ├── new/
│   │   │   │   ├── a/[artifact_id]/  # Artifact detail
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │   ├── p/[slug]/             # Public share routes (SSR, edge-cached)
│   │   │   │   ├── page.tsx
│   │   │   │   └── embed/
│   │   │   ├── _render/[artifact_id]/ # Iframe renderer (sandbox)
│   │   │   ├── api/                  # API routes
│   │   │   │   ├── upload/
│   │   │   │   ├── auth/
│   │   │   │   ├── share/
│   │   │   │   └── webhooks/stripe/
│   │   │   └── og/[slug]/route.ts    # OG image generation
│   │   ├── components/
│   │   │   ├── ui/                   # Brand-aligned primitives (Button, Input, Dialog, etc.)
│   │   │   ├── marketing/            # Marketing site components
│   │   │   ├── product/              # Authenticated product components
│   │   │   ├── presenter/            # Presenter chrome, slide nav, etc.
│   │   │   └── shared/               # Reused across surfaces
│   │   ├── lib/
│   │   │   ├── db/                   # Supabase clients, schema types
│   │   │   ├── storage/              # R2 client, signed URLs
│   │   │   ├── auth/                 # Auth helpers, session
│   │   │   ├── stripe/               # Stripe client, billing helpers
│   │   │   ├── analytics/            # PostHog client, event helpers
│   │   │   ├── ingest/               # HTML parser, mode detector, sanitizer
│   │   │   ├── render/               # Renderer config, CSP builders
│   │   │   └── utils/                # General utilities
│   │   ├── styles/
│   │   │   └── globals.css           # Tailwind base + brand canvas tokens
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── worker/                       # Cloudflare Worker for asset proxy
│       ├── src/
│       │   ├── index.ts
│       │   └── allowlist.ts
│       └── wrangler.toml
├── packages/
│   ├── brand-tokens/                 # CSS variables from brand canvas
│   │   └── tokens.css
│   └── shared-types/                 # Shared TS types between web and worker
│       └── index.ts
├── supabase/
│   ├── migrations/                   # SQL migrations (versioned)
│   └── functions/                    # Supabase Edge Functions if needed
├── tests/
│   ├── e2e/                          # Playwright tests
│   └── fixtures/                     # 8 reference artifacts for visual regression
├── runbooks/                         # Pre-written runbooks for incidents
│   ├── dmca-takedown.md
│   ├── gdpr-deletion.md
│   ├── security-incident.md
│   ├── payment-outage.md
│   ├── mass-abuse.md
│   └── render-outage.md
├── docs/                             # All the artifacts above + this brief
│   ├── zili-prd-v0.3.md
│   ├── zili-requirements-gherkin-v0.2.md
│   ├── zili-brand.html
│   ├── zili-journey-map.html
│   ├── zili-swimlane.html
│   ├── zili-sprint-plan.html
│   ├── zili-marketing-site.html
│   ├── zili-demo-states.html
│   ├── zili-admin-mocks.html
│   └── zili-claude-code-handoff.md   # This document
├── .env.example
├── .gitignore
├── pnpm-workspace.yaml
├── package.json
├── README.md
└── CLAUDE.md                         # Pointer to this brief, for Claude Code's startup
```

---

## 6. Coding conventions

### TypeScript

- **Strict mode on.** `tsconfig.json` has `"strict": true`. No exceptions.
- **No `any`.** Use `unknown` when type is genuinely unknown; refine with type guards.
- **Prefer types over interfaces** for object shapes. Use interfaces only for class shapes.
- **Branded types for IDs.** `type UserId = string & { readonly _brand: 'UserId' }` prevents passing a `ShareId` where a `UserId` is expected.
- **Discriminated unions for state.** Plan states, render states, etc. always use discriminated unions, not nullable fields.

### File naming

- **Components:** PascalCase, one component per file. `ShareButton.tsx`, `PresenterChrome.tsx`.
- **Utilities:** camelCase. `formatSlug.ts`, `parseArtifact.ts`.
- **Routes:** Next.js conventions (`page.tsx`, `layout.tsx`, `route.ts`).
- **Tests:** colocated as `*.test.ts` or `*.test.tsx`.

### React/Next conventions

- **Server Components by default.** Mark Client Components with `'use client'` only when needed (interactivity, hooks).
- **Co-locate Tailwind classes** with the component. No separate CSS files except `globals.css`.
- **Use Next's built-in primitives** (`<Link>`, `<Image>`, `<Script>`) over plain HTML where applicable.
- **Form handling via Server Actions** where appropriate; client-side only when interactivity demands.
- **Error boundaries** at the route layout level.

### Database

- **Migrations are append-only.** Once a migration is committed, never edit it — write a new one.
- **All tables have `created_at` and `updated_at`** (Postgres triggers maintain `updated_at`).
- **All user-owned tables have `user_id`** with foreign key + ON DELETE CASCADE (except for audit log entries).
- **Use Postgres enums for closed sets** (plan states, action types, reason codes).
- **RLS (Row Level Security) enabled on all user-data tables.** Policies in migrations.

### Naming things

- **Booleans:** prefix with `is`, `has`, `can`, `should`. `isShared`, `canEdit`, `shouldShowWatermark`.
- **Async functions:** name what they do, not what they return. `fetchArtifact()`, not `getArtifactPromise()`.
- **Event handlers:** prefix with `handle`. `handleUpload`, `handleSaveModalDismiss`.
- **Boolean props on components:** prefer positive framing. `isVisible` not `isHidden`.

### Error handling

- **Never silently swallow errors.** Always log to Sentry, even if recovered.
- **User-facing errors come from a central dictionary** (`lib/errors.ts`). Each error has a code, title, body, suggested action.
- **API routes return typed errors.** `{ error: { code, message } }` shape — never raw strings.

### Testing

- **Unit tests for non-trivial logic.** Pure functions, parsers, transformers.
- **E2E tests for critical user flows.** Sign-up → upload → present → share. Run on CI.
- **Visual regression tests for the renderer.** 8 reference artifacts, Playwright + screenshot diff, fails CI if drift > 2%.
- **No 100% coverage target.** Cover what's risky. Skip what's trivial.

### Commits

- **Conventional commits.** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- **One concern per commit.** If the diff covers two things, split it.
- **Reference the sprint task ID** in the commit message: `feat(S2.4): add slide-mode detection heuristics`.

---

## 7. Build sequence — dependency-ordered

This is the order Claude Code should build things in. Each item depends on what comes before it. Skipping ahead causes rework.

### Sprint 1 — Render foundation

1. Repo scaffold, monorepo setup (pnpm workspaces), TypeScript config, ESLint+Prettier
2. Tailwind config with brand-canvas tokens (CSS variables for palette, font families)
3. Supabase project setup, initial migration (users + artifacts tables)
4. R2 bucket + signed upload URL endpoint
5. Sandboxed iframe renderer route (`_render/[artifact_id]`)
6. Asset proxy Cloudflare Worker
7. CSP header builder + asset allow-list table
8. Visual regression test harness (Playwright + 8 reference artifacts)

### Sprint 2 — Auth, library, mode detection

1. Supabase Auth integration (Google OAuth + email)
2. Auth middleware for app routes
3. /library page (Server Component + Supabase fetch)
4. /new upload page (drag-drop, paste HTML, paste URL)
5. Ingest pipeline (parse HTML → detect mode → write metadata)
6. Manual mode override toggle
7. Thumbnail generation (Playwright headless screenshot)
8. Mode detection accuracy test (25-artifact corpus)

### Sprint 3 — Presentation modes

1. Slide-mode presenter (counter, prev/next, slide segmentation)
2. Document-mode presenter (scroll, chrome fade)
3. Keyboard navigation (Arrow, Space, PageDown, Home, End, F, Esc)
4. Fullscreen API integration
5. Mobile swipe gestures
6. Aspect-ratio scaling
7. First-time tooltip

### Sprint 4 — Sharing, OG cards

1. Slug generation + collision handling
2. /p/[slug] SSR route with edge cache
3. OG image generation (@vercel/og)
4. Share modal UI
5. Embed route (/p/[slug]/embed without chrome)
6. Brand-aligned UI polish across detail, library, present, share modal
7. Alpha invite flow

### Sprint 5 — Marketing site, live demo

1. Marketing site routes ((marketing) route group)
2. Homepage with hero (per `zili-marketing-site.html`)
3. Live demo widget with all 5 states (per `zili-demo-states.html`)
4. Demo-to-account conversion flow (session → user transfer)
5. Examples gallery (curated, filterable)
6. Pricing page
7. Legal pages (Terms, Privacy, DMCA)

### Sprint 6 — Watermark loop

1. "Made with Zili" watermark element (feature-flagged)
2. End-of-deck overlay (slide-mode last slide, document-mode scroll-bottom)
3. UTM attribution chain (watermark → landing → signup)
4. Referrer-aware landing page
5. View tracking (anonymized counter per shared link)
6. View count display on library card and detail page

### Sprint 7 — Library polish, search, retention

1. Library full-text search (Postgres trigram)
2. Inline rename
3. Re-upload flow (preserve share URL, regen thumbnails)
4. Soft-delete with 30-day grace + restoration UI
5. Revoke share link + branded 404
6. Weekly email digest (Resend)
7. Mode-mismatch recovery UX

### Sprint 8 — Admin baseline, private beta

1. Retool workspace setup (connected to Postgres + Stripe + app API)
2. Admin dashboard (per `zili-admin-mocks.html`)
3. User detail page (per mocks)
4. Account suspension flow (invalidate sessions, branded 404 on shares)
5. Audit log table (Postgres triggers, append-only)
6. Slack ops channel (Slack webhook for events)
7. Abuse report widget on shared decks + admin queue
8. Onboarding email sequence (welcome, day-3, week-1)

### Sprint 9 — Billing, pricing state

1. Stripe Products + Prices setup (Pro $12, Pro annual $108)
2. Grandfather coupon (50% off for life)
3. Stripe webhook handler (lifecycle events)
4. Plan state machine (`free` → `grandfather_eligible` → `grandfather_locked` / `pro`)
5. Feature flag system (watermark, library cap)
6. Settings page (current plan, change plan, manage payment)
7. Refund flow in admin
8. External security review coordination

### Sprint 10 — Speaker view, polish, brand sweep

1. Speaker view (separate window, current/next slide, notes, timer)
2. Speaker notes extraction (`<aside class="notes">`, HTML comments)
3. Mobile QA pass (Safari iOS, Chrome Android, top viewports)
4. Designer brand-sweep collaboration
5. Accessibility audit
6. Performance pass (Lighthouse 90+)

### Sprint 11 — Runbooks, status page, launch prep

1. Six runbooks (DMCA, GDPR, security, payment outage, mass abuse, render outage)
2. Templated customer comms (suspension, refund, DMCA, take-down, restoration)
3. Public status page (status.zili.xyz)
4. DMCA take-down flow in admin (counter-notice path)
5. GDPR deletion flow (30-day purge, do-not-recreate list)
6. Marketing copy review by external writer
7. Load testing (1000 concurrent shared-link views)

### Sprint 12 — Launch readiness

1. Bug fixes from beta feedback (capacity reserved, not pre-allocated)
2. Launch announcement copy + assets
3. ProductHunt / HN kit
4. PostHog launch-day cohort dashboards
5. Final security + accessibility re-test
6. Launch day pre-flight checklist
7. Buffer week

---

## 8. Database schema overview

A high-level reference. Detailed migrations live in `supabase/migrations/`.

### Core tables

**`users`** — Managed by Supabase Auth, extended with app fields
- `id` (uuid, pk, FK to auth.users)
- `email` (text, unique)
- `display_name` (text)
- `plan_state` (enum: free | grandfather_eligible | grandfather_locked | pro)
- `signup_at` (timestamptz)
- `grandfather_eligible_until` (timestamptz, nullable)
- `suspended_at` (timestamptz, nullable)
- `suspended_reason` (enum, nullable)
- `created_at`, `updated_at`

**`artifacts`**
- `id` (uuid, pk)
- `user_id` (uuid, FK users)
- `title` (text)
- `r2_key` (text, unique)
- `slide_count` (int)
- `mode` (enum: slides | document)
- `mode_override` (enum: slides | document, nullable)
- `size_bytes` (int)
- `created_at`, `updated_at`
- `deleted_at` (timestamptz, nullable for soft-delete)

**`share_links`**
- `id` (uuid, pk)
- `artifact_id` (uuid, FK artifacts, unique)
- `slug` (text, unique, indexed)
- `view_count` (int, default 0)
- `revoked_at` (timestamptz, nullable)
- `created_at`, `updated_at`

**`share_link_views`** — Anonymized
- `id` (uuid, pk)
- `share_link_id` (uuid, FK)
- `viewed_at` (timestamptz)
- `country` (text, from IP geolookup)
- `device_kind` (enum: desktop | mobile | tablet)

**`asset_allowlist`**
- `id` (uuid, pk)
- `origin` (text, unique)
- `added_by` (uuid, FK users)
- `reason` (text)
- `created_at`

**`audit_log`** — Append-only, immutable
- `id` (uuid, pk)
- `actor_id` (uuid, FK users — operator)
- `action_type` (enum: create | update | delete | suspend | refund | grant | revoke | take_down | reinstate)
- `target_type` (enum: user | artifact | share_link | system)
- `target_id` (uuid, nullable)
- `reason_code` (enum)
- `reason_note` (text, nullable)
- `meta` (jsonb)
- `created_at` (timestamptz, default now())
- *No `updated_at`, no UPDATE or DELETE grants*

**`abuse_reports`**
- `id` (uuid, pk)
- `share_link_id` (uuid, FK)
- `reporter_ip_hash` (text)
- `reporter_email` (text, nullable)
- `reason` (enum: spam | hate | sexual | dmca | other)
- `note` (text, nullable)
- `status` (enum: open | triaged | dismissed | actioned)
- `created_at`

**`dmca_notices`**
- `id` (uuid, pk)
- `share_link_id` (uuid, FK)
- `complainant_name` (text)
- `complainant_contact` (text)
- `description` (text)
- `received_at` (timestamptz)
- `action_taken_at` (timestamptz, nullable)
- `counter_notice_at` (timestamptz, nullable)
- `reinstated_at` (timestamptz, nullable)

**`demo_sessions`** — Temporary, 24h
- `token` (text, pk)
- `r2_key` (text)
- `expires_at` (timestamptz)
- `claimed_by_user_id` (uuid, FK users, nullable)
- `created_at`

### Triggers and policies

- `updated_at` auto-set on row update for all tables that have it
- RLS on `artifacts`, `share_links`: user can only read/write their own
- RLS on `audit_log`: only operator role can read; INSERT allowed via SECURITY DEFINER function; UPDATE/DELETE denied at the role level
- `share_link_views.viewed_at` indexed for analytics queries

---

## 9. The first-session script

This is what the human pastes into Claude Code at the start of Sprint 1, after running `git init` and creating the empty repo.

```
You are about to implement Zili V1, a platform for presenting and sharing
HTML artifacts generated by LLMs.

Before you write any code:

1. Read `docs/zili-claude-code-handoff.md` in full. This is the contract.
2. Read `docs/zili-prd-v0.3.md` for product strategy and locked decisions.
3. Skim `docs/zili-brand.html` to internalize the design direction.
4. Read the Sprint 1 card in `docs/zili-sprint-plan.html`.
5. Read Feature 2 (Artifact upload) and Feature 3 (Artifact rendering & mode
   detection) in `docs/zili-requirements-gherkin-v0.2.md`.

Then begin Sprint 1, following the build sequence in §7 of the handoff brief.

The Sprint 1 goal is to prove that a single HTML file can be uploaded,
stored, and rendered in a sandboxed iframe with full visual fidelity. No
auth, no UI polish, no sharing — just: does the hardest technical bet work?

By the end of Sprint 1, demoable state is: I can curl-POST an HTML file
to /api/upload and get back a URL. Visiting that URL renders the artifact
pixel-perfect for at least 7 of 8 reference artifacts in /tests/fixtures/.

You are empowered to make implementation decisions per §3 of the handoff
brief. Ask before doing anything in the "MUST ask before" list. Notify
after doing anything in the "MUST notify after" list.

Start by proposing the first 3 commits, in order, with their conventional
commit messages. I'll approve, then you proceed.
```

This script is short on purpose. Claude Code has everything it needs from the linked artifacts.

---

## 10. Per-sprint handoff format

The human provides this template at the start of each sprint:

```markdown
# Sprint [N] handoff

## Goal
[Single sentence — what this sprint proves or delivers]

## Required reading
- Sprint card: docs/zili-sprint-plan.html — Sprint [N]
- Gherkin features in scope: [list feature numbers]
- Mocks in scope: [list mock files]
- Anything new from the previous sprint demo: [link or note]

## Tasks (from sprint plan)
- [ ] S[N].1 — [task name and any spec notes]
- [ ] S[N].2 — [...]
- [ ] ...

## Definition of done
[Copy from sprint plan card, refine if needed]

## Open questions for human
[Any questions Claude Code surfaced from the previous sprint that block this one]

## Locked decisions this sprint
[Any new decisions made since the last sprint that Claude Code should know about]

## Demo target — Friday of week 2
[What specifically gets demoed]
```

The human fills out this template, drops it in `docs/sprints/sprint-N.md`, and points Claude Code at it.

---

## 11. Quality gates

Before any code is considered done, it must pass:

1. **TypeScript compiles with strict mode and no errors.** No `@ts-ignore` without an explanatory comment.
2. **Lint passes.** No `eslint-disable` without an explanatory comment.
3. **Tests pass.** Unit and e2e where applicable.
4. **Visual regression passes** for any change touching the renderer.
5. **Definition of Done in the sprint brief is met.** All checkboxes ticked.
6. **Sentry has no new error patterns** from the new code paths (verified post-deploy).
7. **The demoable state in the sprint brief works end-to-end** when manually exercised.

Per-sprint, Claude Code reports gate-pass status and any failures clearly. The human reviews and either approves or sends back for fixes.

---

## 12. What human review is for

The human is not a typist or a rubber-stamper. The human review focuses on:

- **Strategic correctness** — did the implementation serve the intent, not just the letter, of the requirement?
- **Brand judgement** — does the UI feel like the brand canvas, or does it feel SaaS-generic?
- **Pricing and conversion logic** — does the implementation behave correctly across all four billing states and all journey handoffs?
- **Security posture** — was the principle of least privilege followed? Is the audit log truly immutable?
- **Edge cases the spec didn't cover** — what happens with a 9.99MB file, a 10.01MB file, an HTML file with no `<title>`?
- **The demo** — does the Friday demo prove the sprint goal?

The human is NOT reviewing line-by-line code style. That's lint's job.

---

## 13. Common pitfalls — what not to do

A checklist drawn from observed failure modes in autonomous coding work.

### Don't:

- **Don't add dependencies without asking.** A new dependency is a new supply-chain risk and a new opinion. Ask.
- **Don't silently change architectural decisions** because something "would be easier" with a different approach. The decisions in §4 are decided. If you have a strong case to change one, raise it explicitly.
- **Don't reorder the build sequence** without proposing the new order. Sequence matters because of dependencies.
- **Don't implement features that aren't in the sprint brief.** Scope creep is the enemy. Note discoveries in `docs/discoveries.md` for future sprints.
- **Don't write copy from imagination.** Headers, error messages, microcopy — pull from the brand canvas, the marketing site mock, or the existing app. If new copy is needed, ask the human.
- **Don't skip the visual regression harness.** Any change to the renderer must pass the 8-artifact corpus check before the sprint is done.
- **Don't introduce framework-level patterns mid-sprint.** "Let me add a state management library" is an architecture-level decision. Use what's already there.
- **Don't bypass the audit log.** Any admin-equivalent action must write to the audit log in the same transaction as the action itself. No exceptions.
- **Don't optimise prematurely.** If a page loads in 800ms, that's fine. Don't add caching layers for problems that don't exist.
- **Don't write tests that test the framework.** Test your code, not Next.js or Supabase.
- **Don't catch and ignore errors.** Always log to Sentry. Always.
- **Don't merge to main without the sprint demo working end-to-end.** Sprint demo is the gate, not the suggestion.

### Do:

- **Do propose the first 3 commits at the start of each sprint.** Helps the human catch direction errors early.
- **Do flag any internal inconsistency** you find in the artifacts. The PRD might contradict the Gherkin. Surface it, don't paper over it.
- **Do use the brand canvas tokens.** Don't reinvent colors or type scales.
- **Do write good commit messages.** Future-you will thank you when bisecting a regression.
- **Do leave the campsite cleaner than you found it.** Small refactors for clarity are welcome, as long as they don't change behaviour and they're in their own commit.
- **Do ask "what's the simplest thing that could possibly work?"** before reaching for an abstraction.
- **Do trust the brief, then verify.** The brief was written carefully. But it's a document, not infallible. Cross-check with the Gherkin and the mocks. If something is unclear, ask.

---

## Appendix A — Glossary

| Term | Meaning |
|---|---|
| **Artifact** | A user-uploaded HTML file (and any associated assets in V1.5+) |
| **Slide mode** | Presentation mode where the artifact is segmented into discrete slides |
| **Document mode** | Presentation mode where the artifact is rendered as a single scrolling document |
| **Slug** | The URL-safe identifier in a shared link: `zili.xyz/p/{slug}` |
| **Watermark** | The "Made with Zili" branding shown on free-tier shared decks (post-promo) |
| **Launch window** | First 3 months after public launch (everything is free, no watermark, no caps) |
| **Grandfather window** | Days 91–120 after launch (grandfather cohort upgrades to 50%-for-life Pro) |
| **Grandfather cohort** | Users who signed up during the launch window |
| **Operator** | The internal admin role (you, in V1) |
| **Visual regression** | Screenshot diff testing using Playwright against reference artifacts |

---

## Appendix B — File checklist for a sprint completion

When Claude Code declares a sprint complete, the human checks:

- [ ] All tasks in the sprint brief are checked off
- [ ] `docs/sprints/sprint-N-report.md` exists with: what was built, what was deferred, any open questions for next sprint
- [ ] `docs/discoveries.md` updated with anything found that wasn't in scope
- [ ] All quality gates (§11) pass
- [ ] Sprint demo recording exists at `docs/sprints/sprint-N-demo.mov` (Loom or local)
- [ ] No unmerged feature branches
- [ ] Sentry dashboard is clean (no new error patterns)
- [ ] PostHog dashboards updated if new events were instrumented

---

*This brief is the contract. Update it when contracts change. Treat it as version-controlled, peer-reviewed, and serious. Implementation quality is downstream of clarity here.*
