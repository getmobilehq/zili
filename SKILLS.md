# SKILLS.md — Zili

**Audience** Claude Code, during implementation
**Purpose** Registry of project-specific reusable patterns. Reach for these instead of reinventing.
**Status** Living document. Add a new skill when you find yourself solving the same problem twice.

---

## How to use this document

A *skill* is a project-specific pattern you've established once and want to reuse consistently. Not a general coding skill — those you already have. A Zili skill encodes a decision about *how Zili does this thing*.

Each entry has:
- **When to use** — the trigger condition
- **The pattern** — the steps
- **Watch out for** — common mistakes
- **Files involved** — typical scope of changes
- **Linked to** — related skills or artifacts

**Before implementing anything that feels familiar, search this file.** The skill probably exists. If it doesn't, add it once you've implemented the new pattern.

**To add a new skill:**
1. Implement the pattern at least once successfully.
2. Verify it's project-policy, not personal preference.
3. Add an entry to the relevant section below.
4. Reference it in the LOOP.md entry for the sprint where you used it.

---

## Skill index

### Domain skills
- [SK-01 — Add a new admin action with audit logging](#sk-01--add-a-new-admin-action-with-audit-logging)
- [SK-02 — Add a new entry to the CSP asset allow-list](#sk-02--add-a-new-entry-to-the-csp-asset-allow-list)
- [SK-03 — Add a new feature flag](#sk-03--add-a-new-feature-flag)
- [SK-04 — Add a new error code with user-facing messaging](#sk-04--add-a-new-error-code-with-user-facing-messaging)
- [SK-05 — Add a new PostHog analytics event](#sk-05--add-a-new-posthog-analytics-event)
- [SK-06 — Handle a new Stripe webhook event](#sk-06--handle-a-new-stripe-webhook-event)
- [SK-07 — Add a new templated email](#sk-07--add-a-new-templated-email)
- [SK-08 — Add a new reason code to the audit log](#sk-08--add-a-new-reason-code-to-the-audit-log)

### Engineering skills
- [SK-09 — Write a Supabase migration](#sk-09--write-a-supabase-migration)
- [SK-10 — Add a new Server Action](#sk-10--add-a-new-server-action)
- [SK-11 — Add a new visual regression fixture](#sk-11--add-a-new-visual-regression-fixture)
- [SK-12 — Add a new component to the brand UI library](#sk-12--add-a-new-component-to-the-brand-ui-library)

### Process skills
- [SK-13 — Start a sprint](#sk-13--start-a-sprint)
- [SK-14 — End a sprint](#sk-14--end-a-sprint)
- [SK-15 — Handle a discovered scope item that isn't in the sprint brief](#sk-15--handle-a-discovered-scope-item-that-isnt-in-the-sprint-brief)

---

## Domain skills

### SK-01 — Add a new admin action with audit logging

**When to use:** Any operator-facing action that modifies user data, billing, content, or system configuration. Suspending an account, taking down content, granting comp, updating CSP — all of these.

**The pattern:**

1. Write a Postgres function `app.action_<verb_noun>(actor_id, target_id, params jsonb, reason reason_code_enum, note text)`.
2. The function performs the action AND inserts the audit log row in a single transaction.
3. `SECURITY DEFINER` so it can write to the audit log (which is otherwise INSERT-only via specific roles).
4. The function returns the audit log row ID for confirmation.
5. Expose the function to Retool via a Postgres view or direct call (Retool query).
6. On the application side, never call the underlying DML directly for these actions — always go through the function.

**Watch out for:**
- The audit log row must be in the SAME transaction. A separate INSERT afterward defeats the integrity guarantee.
- Always require a `reason` enum value. Don't allow free-text-only reasons.
- The function must be `SECURITY DEFINER` with `SET search_path = pg_catalog, public` to prevent search-path attacks.
- For destructive actions (suspend, delete), the function should also invalidate sessions / revoke share links as needed, all in the same transaction.

**Files involved:**
- `supabase/migrations/<timestamp>_add_action_<verb_noun>.sql`
- Retool query (in Retool UI, named `action_<verb_noun>`)
- Optional: app-side helper in `lib/admin/actions.ts` if called from app code, not Retool

**Linked to:** SK-08 (reason codes), §4 of handoff (audit log integrity)

---

### SK-02 — Add a new entry to the CSP asset allow-list

**When to use:** A user reports that an external resource their LLM artifact references is blocked. After verification, you're adding it to the allow-list.

**The pattern:**

1. Verify the domain is widely-used and unlikely to host malicious content (CDNs for known libraries, not arbitrary user-hosted URLs).
2. Use SK-01 (admin action) — call `app.action_update_allowlist(actor_id, 'origin_url', 'add', reason)`.
3. The function inserts the row in `asset_allowlist`.
4. The Cloudflare Worker reads from this table on each request, cached at the edge with a 5-minute TTL.
5. After adding, manually verify a test artifact referencing the new origin renders correctly.

**Watch out for:**
- Never allow-list user-uploaded URLs or paths under user control.
- Be specific with origins — `https://cdn.example.com` not `https://*.example.com`. Wildcards expand the attack surface.
- The edge cache means the change takes up to 5 minutes to propagate.
- Removing an entry can break already-shared decks. Coordinate removal with a deprecation window.

**Files involved:**
- `supabase/migrations/<timestamp>_add_allowlist_entry.sql` if seeding initial set
- Audit log entry (automatic via SK-01)
- No application-side change needed; Worker reads dynamically

**Linked to:** SK-01

---

### SK-03 — Add a new feature flag

**When to use:** Introducing behaviour that needs to be toggled per environment, per user cohort, or via the launch promo state machine. The watermark and library cap are the canonical examples.

**The pattern:**

1. Add the flag to PostHog (Feature Flags section).
2. Define the flag in `lib/flags/flags.ts` as a typed constant: `export const FLAG_WATERMARK = 'watermark_enabled' as const;`.
3. Write a hook `useFlag(FLAG_WATERMARK)` for client components.
4. Write a server helper `getFlag(FLAG_WATERMARK, userContext)` for server components.
5. Wire the flag to relevant rendering logic.
6. Document the flag in this skill registry (a short note in LOOP.md is fine).
7. Default the flag OFF in production until explicitly enabled.

**Watch out for:**
- Don't proliferate flags. Each flag is a permanent maintenance cost. Use them for genuinely toggleable behaviour.
- Tie flags to billing state when applicable, not just to free booleans. The watermark flag, for example, should check `plan_state === 'free'` AND `flag_enabled === true`.
- Document the flag's eventual fate: temporary (for launch promo) or permanent (e.g. for plan tier differentiation).

**Files involved:**
- `lib/flags/flags.ts`
- `lib/flags/server.ts`, `lib/flags/client.ts` if hooks added
- The component(s) gated on the flag

---

### SK-04 — Add a new error code with user-facing messaging

**When to use:** Adding a new error condition that surfaces to the user. File too large, malformed HTML, security violation, server timeout, etc.

**The pattern:**

1. Open `lib/errors.ts`.
2. Add an entry to the central error dictionary:
   ```typescript
   FILE_TOO_LARGE: {
     code: 'FILE_TOO_LARGE',
     title: 'That file is over 10MB.',
     body: 'Zili currently accepts HTML files up to 10MB. Most LLM artifacts are well under this — yours is probably bundled with images or a large CSS file. Try uploading the HTML alone, or split out the assets.',
     suggestedAction: 'Try another file',
     httpStatus: 413,
   }
   ```
3. Reference the error by symbol in the calling code: `throw new ZiliError(Errors.FILE_TOO_LARGE)`.
4. The API route's error handler maps `ZiliError` to the response shape `{ error: { code, message } }`.
5. Frontend uses the error code to look up display copy from the same dictionary.

**Watch out for:**
- Never write user-facing error copy inline at the throw site. Always go through the dictionary.
- Always include a `suggestedAction` — recovery is one click, never a dead end (per demo-state mocks).
- Errors are specific, not generic. "Something went wrong" is never the right error message.
- Tone: honest, not apologetic. No "Oops!" No emoji.

**Files involved:**
- `lib/errors.ts`
- The component or page rendering the error
- Sentry will pick up the error automatically via the unified handler

---

### SK-05 — Add a new PostHog analytics event

**When to use:** Instrumenting a new user behaviour, conversion step, or state transition. Demo drop, save modal shown, signup completed — all events that go in funnels.

**The pattern:**

1. Open `lib/analytics/events.ts`.
2. Add the event name as a typed constant: `export const EVENT_DEMO_DROP = 'demo_drop' as const;`.
3. Define the event's properties as a TypeScript type.
4. Call `posthog.capture(EVENT_DEMO_DROP, { ... })` from the calling code via the central wrapper, not the raw client.
5. Add the event to the PostHog dashboard's relevant funnel(s).
6. Add the event to `docs/analytics-events.md` for future reference.

**Watch out for:**
- Use snake_case for event names. PostHog convention.
- Properties should be flat (no nested objects). Helps with funnel and breakdown queries.
- Don't include PII in event properties. User IDs are okay; emails, IPs, names are not.
- If the event is privacy-sensitive (e.g. content interactions), check it doesn't leak deck contents.

**Files involved:**
- `lib/analytics/events.ts`
- The component or handler triggering the event
- `docs/analytics-events.md`
- PostHog dashboard config (update funnel definitions)

---

### SK-06 — Handle a new Stripe webhook event

**When to use:** A new subscription lifecycle event needs handling. Payment failed, subscription paused, plan switched, etc.

**The pattern:**

1. Open `app/api/webhooks/stripe/route.ts`.
2. Add a case to the event-type switch.
3. The handler should:
   - Verify the webhook signature (existing helper does this — don't bypass).
   - Look up the affected user by `stripe_customer_id`.
   - Update `users.plan_state` via SK-01 (admin action — even though the actor is the system, audit it).
   - Trigger any downstream effects (email notification, feature flag update).
   - Return 200 OK to Stripe even if the downstream effect is async.
4. Add a test fixture with a sample webhook payload.
5. Test against Stripe CLI's `stripe trigger <event>`.

**Watch out for:**
- Always verify the webhook signature. Never trust the payload directly.
- Be idempotent. Stripe retries; handle the same event arriving twice without double-effect.
- Don't block on downstream effects. Queue them via Supabase Edge Functions or background jobs.
- Always audit the plan state change. The actor is "system" or "stripe_webhook", but the action is still tracked.

**Files involved:**
- `app/api/webhooks/stripe/route.ts`
- `tests/webhooks/<event>.test.ts`
- `lib/stripe/handlers/<event>.ts` for non-trivial handlers

**Linked to:** SK-01 (audit logging)

---

### SK-07 — Add a new templated email

**When to use:** A new user-facing email is needed. Welcome, weekly digest, suspension notice, DMCA take-down, etc.

**The pattern:**

1. Create a React Email component in `lib/email/templates/<EmailName>.tsx`.
2. Use brand canvas tokens (palette, type). No new colors or fonts.
3. Add the template to the index in `lib/email/index.ts`.
4. Wrap with a typed sender: `sendWelcomeEmail({ to, displayName, ... })`.
5. Use Resend's React Email renderer to convert to HTML.
6. Test rendering: `pnpm email:preview <EmailName>` opens the template in a browser for visual QA.
7. If the email is transactional and tied to a critical event (refund, take-down), also fire a Slack ops channel notification.

**Watch out for:**
- All emails include a footer with: unsubscribe (if non-transactional), Zili branding, link to the user's account.
- Transactional emails (signup confirmation, refund receipt) don't need unsubscribe; marketing/digest emails do.
- Subject lines are concise and editorial. No "🎉" emoji. No "DO NOT REPLY" all-caps.
- For account-action emails (suspended, deleted, DMCA), keep the tone honest and informative, not apologetic or accusatory.

**Files involved:**
- `lib/email/templates/<EmailName>.tsx`
- `lib/email/index.ts`
- `lib/email/preview/<EmailName>.tsx` for the preview entry

---

### SK-08 — Add a new reason code to the audit log

**When to use:** Adding a new category of admin action that doesn't fit existing reason codes. Approach this conservatively — too many reason codes defeats the structure.

**The pattern:**

1. Edit the `reason_code` Postgres enum in a new migration.
2. Add the new value with a clear, scoped name (e.g. `BETA_GRANT`, `MANUAL_OVERRIDE_GRANDFATHER`).
3. Document the trigger condition in `docs/audit-reason-codes.md`.
4. Update Retool's reason dropdown to include the new option.
5. If the new reason is for a new action type (not just a new reason for an existing action), follow SK-01 to add the action function.

**Watch out for:**
- Reason codes are immutable once an audit entry uses them. Once shipped, you can't remove or rename — only deprecate.
- Don't add reason codes for one-off situations. If it'll be used fewer than 3 times a year, use `OTHER` with a free-text note instead.
- Reason codes are SCREAMING_SNAKE_CASE.

**Files involved:**
- `supabase/migrations/<timestamp>_add_reason_<code>.sql`
- `docs/audit-reason-codes.md`
- Retool configuration

**Linked to:** SK-01

---

## Engineering skills

### SK-09 — Write a Supabase migration

**When to use:** Any schema change. New table, new column, new index, new policy, new function.

**The pattern:**

1. Create the file: `supabase/migrations/<YYYYMMDDHHMMSS>_<descriptive_name>.sql`.
2. Use `CREATE TABLE IF NOT EXISTS` and similar idempotent forms where reasonable.
3. Include RLS policies for any user-data table — never ship a table without RLS.
4. Include `created_at` and `updated_at` columns on all tables that need temporal tracking.
5. Add the `updated_at` trigger if applicable: `CREATE TRIGGER update_<table>_updated_at BEFORE UPDATE ON <table> FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();`.
6. Test the migration locally: `pnpm supabase db reset` then verify schema.
7. Commit. Migrations are never edited after merge — only superseded by new migrations.

**Watch out for:**
- Never alter or drop columns in a migration that's already been applied to production. Always additive.
- RLS policies default to deny — explicitly grant only what's needed.
- Migrations are append-only. Renaming a column requires: add new column, backfill, deprecate old.
- For destructive operations, write them in two migrations: one to add the new shape, one (deployed later) to remove the old.

**Files involved:**
- `supabase/migrations/<timestamp>_<name>.sql`

---

### SK-10 — Add a new Server Action

**When to use:** A user-initiated operation that mutates server state and benefits from co-located UI (forms, button-triggered actions in client components).

**The pattern:**

1. Create the action in `app/(app)/<route>/actions.ts` (co-located with the route that uses it).
2. Annotate with `'use server'` at the top of the file.
3. Validate inputs with Zod schema at the top of the action.
4. Authenticate via `getServerSession()` — never trust client-supplied user IDs.
5. Use Supabase server client for DB writes.
6. Return a typed result (`{ ok: true, data } | { ok: false, error: ErrorCode }`).
7. For revalidation, call `revalidatePath()` or `revalidateTag()` after the mutation.

**Watch out for:**
- Server actions are public endpoints. Treat them like API routes — validate, authenticate, rate-limit.
- Never include sensitive data in the return value beyond what the calling component needs.
- For long-running operations, queue them (Supabase Edge Function) and return a job ID, not a result.

**Files involved:**
- `app/(app)/<route>/actions.ts`
- The component that calls the action

---

### SK-11 — Add a new visual regression fixture

**When to use:** Discovering an LLM artifact pattern that the existing 8 reference artifacts don't cover. New gradient style, new layout convention, new CSS feature.

**The pattern:**

1. Save the source HTML to `tests/fixtures/<descriptive-name>.html`.
2. Add an entry to `tests/visual-regression.spec.ts` referencing the new fixture.
3. Run the test once to generate the baseline screenshot.
4. Verify the baseline visually — if it's correct, commit. If not, fix the issue first.
5. The baseline lives at `tests/snapshots/<descriptive-name>.png`.

**Watch out for:**
- Fixtures should be representative of real LLM output, not synthetic edge cases.
- Keep the fixture count manageable. If you're adding more than 15 fixtures, consolidate similar ones.
- Browser-specific rendering differences are common — use `--update-snapshots` only when you've verified the new state is correct.

**Files involved:**
- `tests/fixtures/<name>.html`
- `tests/snapshots/<name>.png`
- `tests/visual-regression.spec.ts`

---

### SK-12 — Add a new component to the brand UI library

**When to use:** A pattern from the brand canvas or mocks is needed in more than one place. Button, Modal, BrandBadge, etc.

**The pattern:**

1. Look in `components/ui/` first — it might exist already.
2. If new, create `components/ui/<ComponentName>.tsx`.
3. Use brand canvas tokens (CSS variables from `styles/globals.css`). No new colors or fonts.
4. Accept a `className` prop for occasional override; don't over-design the API.
5. Provide TypeScript types for all props.
6. Add a usage example as a JSDoc comment.
7. Don't add to a Storybook or component catalog yet — that's V1.5+ if ever.

**Watch out for:**
- Don't generalise prematurely. Two usages might justify a component; one definitely doesn't.
- Don't add styling props for things that should be constants (e.g. don't allow `size="huge"` if the brand canvas only has three sizes).
- Components in `components/ui/` are brand-aligned primitives. Higher-level components live in `components/product/` or `components/marketing/`.

**Files involved:**
- `components/ui/<ComponentName>.tsx`
- Any consumers being refactored to use the new component

---

## Process skills

### SK-13 — Start a sprint

**When to use:** The human has provided a sprint brief and you're ready to begin work.

**The pattern:**

1. Read the sprint brief in `docs/sprints/sprint-N.md`.
2. Read the relevant Gherkin features.
3. Re-read AGENT.md §3 (decision posture).
4. Read the last 2 entries in LOOP.md.
5. Propose the first 3 commits with conventional commit messages, before writing code.
6. Wait for human approval.
7. Once approved, begin work in the order proposed.
8. Report progress after each task (using the routine progress report format from AGENT.md).

**Watch out for:**
- The "propose first 3 commits before coding" rule exists to catch direction errors early. Don't skip it.
- If the brief is ambiguous on any task, ask before starting work on that task — not after.

**Files involved:**
- `docs/sprints/sprint-N.md` (read-only)
- Whatever the sprint touches

**Linked to:** SK-14 (end a sprint), SK-15 (handle scope discovery)

---

### SK-14 — End a sprint

**When to use:** All tasks in the sprint brief are checked off and the Friday demo is ready.

**The pattern:**

1. Verify all quality gates (handoff §11) pass.
2. Write `docs/sprints/sprint-N-report.md` with:
   - What was built (tasks checked off)
   - What was deferred (and why)
   - Open questions for next sprint
   - Demo recording link (Loom or local)
3. Append an entry to LOOP.md (see SK-end-of-sprint reflection format below in LOOP.md itself).
4. Verify no unmerged feature branches.
5. Verify Sentry dashboard is clean.
6. Notify the human: sprint N complete, demo ready.

**Watch out for:**
- Don't mark a sprint complete if a quality gate fails. Even one failure means "not done."
- The LOOP.md entry is required, not optional. Skipping it loses institutional memory.
- The sprint report is for the human; the LOOP.md entry is for you (and future Claude Code sessions).

**Files involved:**
- `docs/sprints/sprint-N-report.md`
- `docs/loop.md` (append-only)

**Linked to:** SK-13, LOOP.md

---

### SK-15 — Handle a discovered scope item that isn't in the sprint brief

**When to use:** You find a bug, missing feature, or improvement that isn't in the current sprint brief but seems important.

**The pattern:**

1. **Do not** implement it inside the current sprint.
2. **Do** capture it in `docs/discoveries.md` with:
   - Date
   - Sprint where it was found
   - What it is
   - Why it matters
   - Recommended priority (urgent / next sprint / V1.5 / V2)
   - Suggested fix or approach
3. If it's `urgent` (blocks the current sprint's demo or is a security issue): notify the human immediately for direction.
4. If it's `next sprint` or later: just capture it; the human will triage during sprint planning.

**Watch out for:**
- Scope creep is the most common failure mode. Discipline matters.
- "It would only take a minute" is the warning sign. Capture it; don't implement it.
- The exception is bugs that block the current sprint demo. Those go in scope but should be flagged to the human.

**Files involved:**
- `docs/discoveries.md` (append-only)

**Linked to:** Common pitfalls in handoff §13

---

## Adding a new skill

If you find yourself solving the same problem twice, that's a skill candidate. Add it here.

**Skill ID format:** `SK-NN` where NN is the next available number.

**Required fields:**
- When to use
- The pattern (numbered steps)
- Watch out for (numbered list of common mistakes)
- Files involved
- Linked to (other skills or artifacts)

**Quality bar:**
- Skills should be 80%+ general — applicable to most instances of the trigger condition.
- Skills should be terse — no narration, just the recipe.
- Skills should encode project policy, not personal preference.

**When in doubt:** propose the skill to the human before adding it. They can sanity-check whether it's truly a project pattern or a one-off.

---

*This file gets denser over time, not longer. As patterns are refined, edit existing skills rather than adding new ones. Quality over quantity.*
