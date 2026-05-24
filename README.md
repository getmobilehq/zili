# Zili

*The last-mile presenter for LLM-generated artifacts.*

Zili takes the HTML output from an LLM (Claude, ChatGPT, v0, Lovable, Bolt) and presents it as a shareable, navigable deck or document — pixel-perfect, no cleanup. Built for internal-facing PMs and independent consultants who use LLMs to draft visual artifacts and currently lose 30–90 minutes per deck rebuilding them in PowerPoint or Google Slides.

**Status:** Pre-implementation. The full strategy and design package is locked. Sprint 1 begins next.

**Domain:** zili.xyz

**Posture:** Serious side bet — solo founder, ~20h/week, ~24 weeks to V1 launch.

---

## What's in this package

This repository (or directory) contains a complete pre-implementation package. Everything Claude Code needs to build V1 is here.

### For Claude Code — startup files

| File | Purpose |
|---|---|
| `AGENT.md` | Standing operating instructions, posture, principles. Read at the start of every session. |
| `CLAUDE.md` | Pointer to AGENT.md (different convention, same content). |
| `SKILLS.md` | Registry of project-specific reusable patterns. Search before reinventing. |
| `LOOP.md` | Institutional memory across sprints. Read most recent 2 entries at the start of each sprint. |

### For Claude Code — the contract

| File | Purpose |
|---|---|
| `docs/zili-claude-code-handoff.md` | **The contract.** Rules of engagement, locked architectural decisions, repo structure, build sequence, conventions, quality gates. The single most important document for Claude Code. |

### For Claude Code — the requirements

| File | Purpose |
|---|---|
| `docs/zili-requirements-gherkin-v0.2.md` | V1 feature requirements in BDD (Given/When/Then) format. Authoritative for behaviour. |

### For Claude Code — the visual references

| File | Purpose |
|---|---|
| `docs/zili-brand.html` | Brand canvas — palette, typography, components, anti-patterns. Single source of truth for visual design. |
| `docs/zili-marketing-site.html` | Homepage spec — sections, copy, structure. Reference for Sprint 5. |
| `docs/zili-demo-states.html` | Post-drop demo flow — five states, conversion mechanic. Reference for Sprint 5. |
| `docs/zili-admin-mocks.html` | Operator surfaces — dashboard, user detail, moderation queue, audit log. Reference for Sprint 8. |

### For the human — strategy and planning

| File | Purpose |
|---|---|
| `docs/zili-prd-v0.3.md` | Product Requirements Document. Strategy, locked decisions, success metrics, roadmap. |
| `docs/zili-journey-map.html` | Per-stakeholder journey deep-dive across all four user categories. |
| `docs/zili-swimlane.html` | Cross-stakeholder swimlane showing handoffs and conversion loops. |
| `docs/zili-sprint-plan.html` | 12-sprint MVP plan with tasks, points, dependencies, risk register. |

### For the human — user research

| File | Purpose |
|---|---|
| `docs/zili-validation-script.md` | User research playbook with falsifiable hypotheses, scripts for PMs and consultants, synthesis templates. Run in parallel with Sprint 1. |

---

## How the documents work together

```
                    ┌──────────────────────┐
                    │   AGENT.md           │  ← Claude Code reads first
                    │   (posture)          │     every session
                    └──────────┬───────────┘
                               │
                               │ points to
                               ▼
                    ┌──────────────────────┐
                    │   handoff.md         │  ← The contract
                    │   (rules, decisions, │     between human
                    │    architecture)     │     and Claude Code
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌─────────┐      ┌─────────┐     ┌─────────────┐
        │ PRD     │      │ Gherkin │     │ Mocks       │
        │ (why)   │      │ (what)  │     │ (how it     │
        │         │      │         │     │  looks)     │
        └─────────┘      └─────────┘     └─────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   SKILLS.md          │  ← Patterns Claude
                    │   (how to do         │     Code reaches for
                    │    common things)    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   LOOP.md            │  ← Memory across
                    │   (what worked,      │     sprints
                    │    what didn't)      │
                    └──────────────────────┘
```

**Strategy flows down:** PRD → Gherkin → Mocks → Implementation.
**Memory flows up:** LOOP.md captures learning; SKILLS.md captures patterns; both feed back into how AGENT.md is interpreted.

---

## Quick start

### If you're the human, opening this for the first time after a break

1. Read this README (5 min)
2. Skim `docs/zili-prd-v0.3.md` to remember strategy (10 min)
3. Open `docs/zili-sprint-plan.html` and find where you are (5 min)
4. Check `LOOP.md` for the most recent sprint's notes (5 min)
5. You're up to speed.

### If you're Claude Code, starting Sprint 1

1. Read `AGENT.md` in full (the posture document)
2. Read `docs/zili-claude-code-handoff.md` sections 3, 4, and 7 (rules, decisions, build sequence)
3. Read `docs/sprints/sprint-1.md` (the sprint brief — created by the human)
4. Read Gherkin Features 2 and 3 in `docs/zili-requirements-gherkin-v0.2.md`
5. Skim `docs/zili-brand.html` for the visual direction
6. Propose your first 3 commits to the human
7. Wait for approval
8. Begin

### If you're a future contractor or collaborator

Start with this README, then read the PRD. After that, the documents in `docs/` are organised by what you need:
- For UI work: brand canvas, marketing site mock, demo states, admin mocks
- For backend work: handoff brief, Gherkin requirements
- For research: validation script
- For planning: sprint plan, journey map, swimlane

---

## What V1 includes

**In scope:**
- Upload HTML artifacts (drag-drop, paste, URL)
- Auto-detect slide-mode vs document-mode
- Sandboxed iframe rendering with full CSS fidelity
- Public share links with branded OG cards
- Library, search, rename, re-upload, soft-delete
- Marketing site with live demo
- The watermark loop (end-of-deck CTA, referrer-aware landing, view tracking)
- Stripe billing with 3-month launch promo + grandfather cohort
- Admin surface in Retool (dashboard, user detail, moderation queue, audit log)
- Six pre-written runbooks (DMCA, GDPR, security, payment outage, mass abuse, render outage)

**Out of scope for V1 (deferred to V1.5+):**
- In-platform editor
- Team workspaces / collaboration
- Multi-file zip uploads with assets
- Comments on shared decks
- Password-protected share links
- Custom domains
- Mobile upload (mobile viewing is V1)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Hosting | Vercel |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Object storage | Cloudflare R2 |
| Asset proxy | Cloudflare Workers |
| Payments | Stripe + Stripe Billing |
| Analytics | PostHog |
| Errors | Sentry |
| Admin UI | Retool |
| Email | Resend |
| Styling | Tailwind CSS |
| Language | TypeScript (strict) |
| Package manager | pnpm |
| Testing | Vitest + Playwright |

Full architectural reasoning in `docs/zili-claude-code-handoff.md` §4.

---

## Cost envelope

| Category | Estimated cost |
|---|---|
| Infrastructure (Vercel, Supabase, R2, Retool, Resend, PostHog, Sentry) | ~$120/mo |
| Contractor pulls (designer ×2, security review, copywriter) | $5,800 – $9,500 one-time |
| Stripe (transactional fees only) | % of revenue post-launch |
| Domain | ~$15/yr |

Full breakdown in `docs/zili-sprint-plan.html` §06.

---

## Open decisions before Sprint 1 starts

Six items still need confirmation before engineering begins. Sized to fit in a single 30-minute review session.

1. **Pricing confirmation** — $12/mo Pro, $108/yr, 50%-for-life grandfather. Recommended; not formally locked.
2. **Defensive domain registrations** — zili.app, zili.com? Cheap insurance.
3. **Launch geography** — global day one or English-speaking markets first? Affects legal scope.
4. **Alpha cohort recruitment** — 5 hand-picked alpha users by end of Sprint 3. Who, and how to recruit during S1–S2?
5. **Brand designer choice** — Who designs the polish sweeps in Sprint 4 and Sprint 10? Recruit by end of Sprint 2.
6. **Wordmark final state** — Brand canvas shows "Zili." with amber period. Lock before any marketing asset is built.

Full list with recommendations in `docs/zili-sprint-plan.html` §07.

---

## Timeline at a glance

| Milestone | When | What it proves |
|---|---|---|
| M1 — Render & alpha | End of Sprint 4 (~week 8) | The render works. 5 hand-picked users have uploaded. |
| M2 — Funnel & private beta | End of Sprint 8 (~week 16) | The acquisition funnel works. 50 users actively using. |
| M3 — Production-ready | End of Sprint 12 (~week 24) | Public launch. Status page, runbooks, security review complete. |

Full sprint-by-sprint breakdown in `docs/zili-sprint-plan.html` §04.

---

## License & ownership

[To be defined by the human before code is committed.]

---

*This project is a living thing. Documents are updated, decisions evolve, and the package gets sharper over time. Last full revision: May 2026.*
