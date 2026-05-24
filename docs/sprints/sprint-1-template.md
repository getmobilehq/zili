# Sprint 1 handoff — template

*This is a template. Fill it out before Sprint 1 begins, then save as `sprint-1.md` (replacing this file or keeping this as `sprint-1-template.md`).*

---

## Goal

Prove that a single HTML file can be uploaded, stored, and rendered in a sandboxed iframe with full visual fidelity. No auth, no UI polish, no sharing — just: does the hardest technical bet work?

## Required reading

- Sprint card: `docs/zili-sprint-plan.html` — Sprint 1
- Gherkin features in scope: Feature 2 (Artifact upload), Feature 3 (Artifact rendering & mode detection) in `docs/zili-requirements-gherkin-v0.2.md`
- Brand canvas: `docs/zili-brand.html` (for token reference, even if UI is minimal this sprint)
- Anything new from the previous sprint demo: N/A (first sprint)

## Tasks (from sprint plan)

- [ ] S1.1 — Repo, Next.js scaffold, deploy to Vercel, custom domain wired (3 pts)
- [ ] S1.2 — Supabase project, schema for users + artifacts (minimal) (3 pts)
- [ ] S1.3 — R2 bucket, signed-upload pipeline, file upload to storage (4 pts)
- [ ] S1.4 — Sandboxed iframe renderer with strict CSP (no allow-same-origin) (5 pts)
- [ ] S1.5 — Asset proxy worker for Tailwind CDN, Google Fonts, common CDNs (5 pts)
- [ ] S1.6 — Visual-regression test harness (Playwright + screenshot diffs) (5 pts)
- [ ] S1.7 — Seed 8 reference artifacts (Claude, ChatGPT, v0, Lovable, Bolt) for QA (3 pts)

**Total:** ~28 points

## Definition of done

- I can curl-POST an HTML file to `/api/upload` and get back a URL.
- Visiting that URL renders the artifact pixel-perfect for at least 7 of 8 reference artifacts.
- External assets from the allow-list load. Anything else is blocked by CSP.
- Visual-diff harness flags >2% pixel difference vs. native browser render.

## Open questions for human (to fill in before sprint starts)

- Which 8 reference artifacts to use in the visual regression harness?
- Where does the repo live? (GitHub, GitLab, repo name)
- Branch naming convention? (`main`, `dev`, feature branches?)
- Do Sentry, PostHog, Resend accounts already exist or need to be set up?
- Stripe test mode account ready?
- Cloudflare R2 + Workers account ready?
- Supabase project name?
- Vercel project name?

## Locked decisions this sprint

- Stack per handoff §4 (Next.js, Supabase, R2, Cloudflare Workers).
- Repo structure per handoff §5.
- TypeScript strict mode, Tailwind for styling, pnpm for package management.

## Demo target — Friday of week 2

Five reference artifacts rendering side-by-side — Zili's render vs. the original browser. If they don't match, we don't ship S2 until they do.
