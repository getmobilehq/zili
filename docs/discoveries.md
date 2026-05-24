# discoveries.md — Zili

**Audience** Claude Code and human
**Purpose** Append-only log of scope items found outside the current sprint brief. Per SKILLS.md SK-15.
**Status** Living document.

---

## How to use

When Claude Code finds a bug, missing feature, or improvement that isn't in the current sprint brief — and isn't urgent enough to block the demo — append an entry here. The human triages during sprint planning.

## Entry template

```markdown
## YYYY-MM-DD · Sprint N · [Short title]

**What:** [One paragraph — what was found]

**Why it matters:** [One paragraph — what's at risk if ignored, what's gained if addressed]

**Recommended priority:** Urgent / Next sprint / V1.5 / V2

**Suggested approach:** [If known, 2-4 lines on how to fix or address]

**Found by:** Claude Code / [name]
```

## Triage rules

- **Urgent** → notify the human immediately, don't wait for sprint planning
- **Next sprint** → discussed in next sprint planning session
- **V1.5** → captured in roadmap, revisited after launch
- **V2** → captured in long-term backlog

---

## Entries

## 2026-05-24 · Sprint 1 · `_render` URL collides with Next.js private folders

**What:** Handoff §4/§5 specify the renderer URL `/_render/{artifact_id}`. In the Next.js App Router, any folder whose name starts with `_` is a *private folder* and is excluded from routing — so an `app/_render/` directory produces no route and the URL 404s. Resolved in S1.4 by naming the on-disk folder `app/%5Frender/` (URL-encoded underscore), which Next maps to the literal URL segment `/_render`. The public URL is exactly as the handoff mandates; only the folder name differs from the §5 tree diagram.

**Why it matters:** The §5 repo-structure diagram shows `_render/[artifact_id]/`, which would silently fail if recreated literally. Anyone reading §5 (or regenerating the tree) needs to know the folder is `%5Frender`. The underlying URL contract is unaffected.

**Recommended priority:** Next sprint (doc fix) — not urgent; the renderer works.

**Suggested approach:** Update the §5 tree in `docs/zili-claude-code-handoff.md` to show `%5Frender/[artifact_id]/` with a one-line note, or pick a non-underscore internal prefix if the literal `/_render/` URL isn't essential. SKILLS.md could gain a one-liner on Next private folders.

**Found by:** Claude Code
