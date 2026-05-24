# LOOP.md — Zili

**Audience** Claude Code, every sprint
**Purpose** Institutional memory. What worked, what didn't, what to do differently next sprint.
**Status** Append-only living document.

---

## Why this file exists

Twelve sprints is a long time. Without a feedback loop, you'll repeat mistakes you've already made. You'll re-derive patterns you've already established. You'll lose the texture of what's worked.

This file is your memory.

At the end of every sprint, you append a structured entry. At the start of every sprint, you read the most recent 2 entries (per AGENT.md). Over time, this builds an accurate picture of how this project actually runs — not how it was planned.

---

## How to use this file

### At the end of every sprint

Append an entry using the template below. Be honest. Be specific. The goal is learning, not narrative.

### At the start of every sprint

Read the most recent 2 entries. Look for:
- Patterns flagged "do this again"
- Patterns flagged "don't do this again"
- Open questions left from prior sprints that this sprint should resolve
- Skill candidates that became real skills (cross-reference SKILLS.md)

### Periodically (every 4 sprints)

Re-read the full log. Look for recurring themes across multiple sprints. If something keeps showing up as a problem, escalate it — that's a posture or process issue, not just a sprint problem. Propose a change to AGENT.md or SKILLS.md.

---

## The entry template

Copy and fill out at end of every sprint. Append below the most recent entry.

```markdown
## Sprint [N] — [Sprint name from sprint plan]

**Dates:** [Start date] → [End date]
**Demo:** [Did the Friday demo work? Y/N + brief note]
**DoD met:** [Y/N + which items if N]

### What worked

- [Specific thing that went well. "X technique saved Y time" or "Z pattern was clearer than I expected"]
- [2-5 items]

### What didn't work

- [Specific thing that went poorly. "Estimated A points but took B" or "C approach caused D problem"]
- [2-5 items, with the root cause if known]

### Surprises

- [Something you didn't expect. Could be positive or negative.]
- [Anything that changed your model of the project]

### Decisions to revisit

- [Anything that was decided in this sprint that might need re-examination later]
- [Anything you committed to despite reservations]

### Skills established

- [New SKILLS.md entries added this sprint, if any]
- [Existing skills that got refined or contradicted]

### Open questions for next sprint

- [Anything left unresolved that the next sprint needs to address]
- [Anything you flagged for the human but haven't heard back on]

### Posture check

- [How did the decision posture (ask vs decide) work this sprint?]
- [Did you ask too much? Too little? Was the human's review focused on the right things?]

### One sentence that captures this sprint

> [A single sentence. The kind of thing you'd want next-sprint Claude Code to read first.]
```

---

## Sprint log

*Entries below are appended chronologically. Most recent on top.*

---

## Sprint 0 — Pre-implementation handoff

**Dates:** [Before Sprint 1 begins]
**Demo:** N/A (this is a setup entry)
**DoD met:** N/A

### What worked

- The full pre-implementation artifact set was prepared in advance:
  - PRD (`docs/zili-prd-v0.3.md`)
  - Gherkin requirements (`docs/zili-requirements-gherkin-v0.2.md`)
  - Brand canvas (`docs/zili-brand.html`)
  - Journey map and swimlane (`docs/zili-journey-map.html`, `docs/zili-swimlane.html`)
  - Sprint plan (`docs/zili-sprint-plan.html`)
  - Marketing site, demo states, admin mocks (HTML mocks under `docs/`)
  - User validation script (`docs/zili-validation-script.md`)
  - Handoff brief (`docs/zili-claude-code-handoff.md`)
  - AGENT.md, SKILLS.md, this LOOP.md
- The brand direction is locked (editorial minimal, palette + type tokens defined).
- Strategic decisions are explicit and logged in the PRD appendix.

### What didn't work

- [None yet — work hasn't started.]

### Surprises

- The pre-implementation package is unusually comprehensive for a solo side bet. The trade-off: more upfront planning time, less course-correction time later. This may or may not pay off — measure honestly across the first 4 sprints.

### Decisions to revisit

- Pricing structure (Pro $12/mo, 50% grandfather lifetime) — recommended but not formally locked. Lock before Sprint 9 starts (billing implementation).
- Launch geography (global vs EN-first) — affects legal scope. Decide before Sprint 11 (legal pages).
- Wordmark final state (the amber period after "Zili") — lock before any marketing asset is built.
- Defensive domain registrations (zili.app, zili.com) — cheap insurance, decide in Sprint 0.

### Skills established

- The initial SKILLS.md registry (SK-01 through SK-15) is seeded based on patterns the handoff anticipates. These are *expected* patterns — they'll be confirmed (or contradicted) in practice during Sprints 1–4.

### Open questions for next sprint

- Sprint 1 starts with proving render fidelity. Before any code: confirm the 8 reference artifacts to use in the visual regression harness. Which LLMs, which artifact types, which complexity levels.
- Confirm where the repo lives (GitHub, GitLab?) and what naming convention for branches.
- Confirm whether Sentry, PostHog, and Resend accounts already exist or need to be set up.

### Posture check

- N/A (no posture in play yet).

### One sentence that captures this sprint

> The pre-implementation package is complete and serious — now the question is whether it survives contact with the keyboard.

---

## Lessons that keep recurring (meta-section)

*This section is updated periodically — about every 4 sprints. It captures patterns that show up in multiple entries above. If a lesson appears here, treat it as project-policy, not opinion.*

[Empty until Sprint 4.]

---

## Skill cross-references (meta-section)

*Updated whenever a skill in SKILLS.md is established, refined, or contradicted by experience. Helps trace skill maturity over time.*

| Skill | Established in | Refined in | Contradicted in |
|---|---|---|---|
| [All skills in SKILLS.md are currently "expected" — none yet confirmed in practice.] | | | |

---

## Posture trends (meta-section)

*Track the answer to "is the decision posture working?" over time. Updated every 4 sprints.*

| After sprint | Posture working? | Notes |
|---|---|---|
| 4 | [TBD] | |
| 8 | [TBD] | |
| 12 | [TBD] | |

---

*This file gets longer over time. That's correct. Future you (or future Claude Code) is grateful for every honest entry.*
