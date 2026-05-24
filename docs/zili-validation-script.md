# Zili — user validation interview script

**Version** v0.1 · May 2026
**Owner** [You]
**Status** Ready to run

---

## Table of contents

1. [Purpose & posture](#1-purpose--posture)
2. [Falsifiable hypotheses](#2-falsifiable-hypotheses)
3. [Recruitment](#3-recruitment)
4. [Pre-interview prep](#4-pre-interview-prep)
5. [Script — Internal-facing PMs](#5-script--internal-facing-pms)
6. [Script — Independent consultants](#6-script--independent-consultants)
7. [Post-interview synthesis](#7-post-interview-synthesis)
8. [Cross-interview synthesis](#8-cross-interview-synthesis)
9. [Decision framework — what to do with the findings](#9-decision-framework--what-to-do-with-the-findings)
10. [Anti-patterns — what not to do](#10-anti-patterns--what-not-to-do)

---

## 1. Purpose & posture

**Purpose:** Validate (or disconfirm) the core wedge of Zili — that PMs and consultants generating LLM artifacts experience a sharp, recurring presentation-cleanup pain that they currently work around inefficiently, and that Zili's render-and-share approach would resolve it.

**Posture:** The interviewer's job is to **shut up and listen**. Aim for 70% listening, 30% talking. Past behaviour beats hypothetical preference. Problem validation comes before solution validation.

**What this script will not do:**
- Confirm features (no feature voting, no "would you use X if it had Y?")
- Validate UI (mocks happen separately, with prototype testing, not interviews)
- Test pricing precisely (interviews surface willingness-to-pay range, not exact figures)
- Decide engineering priorities (this is a wedge-validation exercise, not a roadmap one)

**Definition of done for the validation phase:** 10 completed interviews (5 PMs, 5 consultants), synthesised against the 5 hypotheses, with a clear go / iterate / pivot recommendation for the wedge.

---

## 2. Falsifiable hypotheses

Each hypothesis has a kill criterion. If three or more hypotheses fail their kill criteria, the wedge needs rethinking before engineering scoping continues.

| # | Hypothesis | Kill criterion |
|---|---|---|
| **H1** | Target users (PMs, consultants) generate LLM-drafted presentations weekly or more often | Fewer than 60% of interviewees do this weekly |
| **H2** | They experience meaningful pain converting these artifacts into presentable formats — averaging ≥30 minutes of cleanup work per artifact | Average reported cleanup time is <20 minutes, or <60% rate the pain ≥7/10 |
| **H3** | They have tried multiple workarounds (manual rebuild, screenshots, exporting to PDF, asking the LLM to format differently) and remain unsatisfied | <50% have tried more than two workarounds, OR most are satisfied with their current workaround |
| **H4** | The proposed approach — upload HTML, present faithfully, share with a link — resonates as a clear improvement over their current workflow | <60% rate the concept ≥7/10 for "this would meaningfully change my workflow" |
| **H5** | They would be willing to pay individually at the proposed price point ($12/month Pro) for the unwatermarked tier | <40% indicate they would pay $10–15/month for the value described |

**Read order:** if H1 fails, none of the others matter — we're talking to the wrong cohort. If H1 passes but H2 fails, the pain isn't sharp enough. If H1 + H2 pass but H3 fails, users have already solved the problem well enough. If H1–H3 pass but H4 fails, the approach is wrong even if the problem is real. If H1–H4 pass but H5 fails, it's a free-tool problem, not a SaaS one.

---

## 3. Recruitment

### Target: 12 booked, 10 completed

Account for ~15–20% no-show rate. Aim for 6 PMs + 6 consultants booked.

### Screener questions

Use these as a 3-question form before booking. Pass = qualified for interview. Fail = thank politely, don't book.

1. **In the last 30 days, have you used an LLM (Claude, ChatGPT, v0, Lovable, Bolt, Cursor, or similar) to create at least one presentation, deck, or visual document?**
   - Yes → continue
   - No → disqualify

2. **What's your role?**
   - Product Manager (internal-facing) → PM track
   - Independent consultant / advisor → Consultant track
   - Other → ask one follow-up about whether they create LLM-drafted presentations in their role; if so and frequency ≥ weekly, qualify into the closer-matching track; otherwise disqualify

3. **How often do you create presentations or styled documents in your work?**
   - Weekly or more → continue
   - Monthly → continue but flag as lower-fit (cap at 2 of these)
   - Less than monthly → disqualify

### Where to recruit

| Source | Approach | Notes |
|---|---|---|
| Personal network | Direct outreach via DM/email | Highest yield, but biased — flag this in synthesis |
| LinkedIn (PMs) | Search "Product Manager" + 2nd-degree connections, message with screener link | Add personal context to every message |
| PM communities (Lenny's, Mind the Product, Reforge alumni) | Post in relevant Slack/Discord with screener link | Read community rules first; some prohibit recruitment |
| Indie consultant networks | Ask in operator-led communities (On Deck, Indie Hackers, Pavilion) | Consultants are easier to recruit if you offer something in return |
| X (Twitter) | Post asking for 30 minutes from people fitting screener | Lower yield but produces unexpected high-signal respondents |

### Incentive

**Offer $40 Amazon/Stripe gift card** for completed 30-minute interview. Standard rate for B2B research, removes "I'm doing them a favour" framing on both sides. Skip incentive only for close personal-network ties who explicitly refuse it.

### Outreach template

> Hi [Name] — I'm doing user research for a small project I'm building called Zili. It's aimed at people who use LLMs (Claude, ChatGPT, etc.) to create presentations or visual documents.
>
> I'd love 30 minutes of your time to learn about your workflow — not pitch anything. $40 gift card as a thank-you.
>
> Quick 3-question screener: [link]
>
> No pressure if it's not a fit.

---

## 4. Pre-interview prep

### 24 hours before

- Confirm time with respondent via short email
- Send a 1-line agenda: "30 minutes, audio only (or video, your call), about your presentation workflow. Nothing to prepare."
- Verify your recording setup works (with their permission)

### Day of, 15 minutes before

- Open this script in one window
- Open a fresh notes doc (one per interview, named by date + initials)
- Disable all notifications
- Test mic and recording
- Re-read the falsifiable hypotheses to keep them top of mind

### Recording

- **Always ask explicitly** at the start: "Mind if I record this? It's just for my notes — won't be shared anywhere."
- If they decline: take handwritten notes only, plan to spend 10 minutes after the call writing it up
- If they accept: still take notes, but lighter — let the recording do the work

### Mindset reminders

- Your job is to **understand their world**, not validate yours
- **Past behaviour > stated preference**. "Tell me about the last time you..." beats "Would you..."
- **Awkward silence is a feature**. Wait. They'll fill it with the most honest answer.
- **Don't lead.** "How did you feel about that?" not "That must have been frustrating, right?"
- **Don't pitch until problem validation is complete.** If they ask "what is Zili?" early, deflect: "I'll explain at the end — but first I want to make sure I really understand your workflow without colouring it."

---

## 5. Script — Internal-facing PMs

**Total time: 30 minutes**
**Phases:** Warm-up (3 min) · Workflow (8 min) · Pain (8 min) · Concept reveal (8 min) · Pricing (2 min) · Close (1 min)

---

### Phase 1 — Warm-up (3 minutes)

**Goal:** Build rapport, set expectations, get the recording permission.

> Thanks so much for the time. Quick context: I'm building a small project for people who use LLMs to create presentations. I want to spend most of today learning about how you actually work — not pitching anything. I'll explain what I'm building toward the end. Sound good?
>
> Mind if I record this? It's just for my own notes — won't go anywhere.

[Confirm. Hit record.]

> Great. To start — can you tell me about your role? Just briefly — title, what your team builds, how long you've been in it.

[Let them answer. ~60 seconds.]

> And how often would you say you put together internal presentations or styled docs — like for leadership reviews, stakeholder updates, planning artefacts?

[Looking for: weekly or more. Note exact frequency.]

---

### Phase 2 — Current workflow (8 minutes)

**Goal:** Understand the *actual* current workflow in concrete detail. No theory, no opinions yet.

> Tell me about the last presentation or styled doc you made. Doesn't have to be the best one — just the most recent.

[Let them answer fully. Don't interrupt.]

**Probing questions (use as needed, don't run through all of them):**

- Walk me through how you started it — blank file? template? LLM?
- What tools were involved? (Take notes on every tool named.)
- How long did the whole thing take, start to finish?
- Did you use an LLM at any point? Which one, and for what part?
- After the LLM gave you something, what did you do with it next?
- Did you have to clean it up, reformat it, port it anywhere? Tell me about that.
- How did you share or present the final version?

**What to listen for (signals to note):**

- Frequency of LLM use in the workflow
- Whether the LLM output goes into PowerPoint / Google Slides / Keynote (= the conversion pain exists)
- Whether they explicitly mention "had to redo it" / "lost the formatting" / "took longer than I thought" (= unprompted pain language)
- Time estimates — both for the LLM portion and the cleanup portion

**Anti-pattern alert:** Do not say "and was that frustrating?" Do not say "wouldn't it be easier if...?" Just keep asking "what did you do next?" and "and then?" until you have the full picture.

---

### Phase 3 — Pain & workarounds (8 minutes)

**Goal:** Establish whether the cleanup pain is sharp, recurring, and unresolved.

> So you mentioned [X — e.g. "you spent 30 minutes putting it into Google Slides after Claude drafted it"]. Tell me more about that part of the process.

[Let them describe. Probe with:]

- How often does that step happen — every presentation? Most? Some?
- What's the worst version of that you've experienced? Tell me about a specific time.
- On a 1–10 scale, how much does that part bother you? (1 = doesn't, 10 = ruins the workflow.)
- Have you tried other ways to avoid that step? What have you tried?
- Why didn't [each thing they tried] work?

**Specific probes to use if they haven't covered them:**

- Have you ever tried just sharing the raw HTML output with someone? What happened?
- Have you tried asking the LLM to give you a different format (PowerPoint XML, slides-flavored markdown, etc.)? Did that help?
- Have you tried tools like Gamma, Tome, or Beautiful.ai? Why did you stop / keep using them?
- If you could wave a magic wand and make this part go away, what would the ideal solution look like? (Note: this is the only "hypothetical" question allowed in this phase, and only if asked at the end.)

**What to listen for:**

- Average time spent on cleanup (your H2 number)
- Pain severity rating (your H2 ≥7/10 check)
- Number of workarounds tried (your H3 ≥2 check)
- Whether they describe their current approach as "fine" / "good enough" — H3 disconfirmation signal
- Whether they describe a "magic wand" solution that sounds like Zili — strong H4 signal even before the reveal

---

### Phase 4 — Concept reveal (8 minutes)

**Goal:** Test reaction to Zili's specific approach, without leading.

> Okay — here's what I'm building. It's called Zili. Imagine you upload the HTML output from Claude or ChatGPT to a web app. It renders that HTML faithfully — every gradient, every font, every animation. It auto-detects whether to present it as slides or as a scrolling document. You can then send a link to your team that opens it in a clean presenter view — no signup needed for them to view. You can also present it fullscreen, navigate with arrow keys, share via Slack.
>
> No editor, no template — just take what your LLM made and present it as-is.
>
> What's your first reaction?

[Stop talking. Wait. They will pause. Let them.]

[Probe with:]

- What jumps out at you — positively or negatively?
- Where does this fit in your current workflow, if at all?
- What concerns or doubts come up for you?
- On a 1–10 scale, how much would this meaningfully change your workflow? Why that number?
- Who else in your world would care about this? Who wouldn't?

**Optional reveal of supporting detail (only if asked):**

- Share works without recipient needing an account
- We sandbox the HTML — secure to upload
- Mobile-friendly for the audience
- Works with Claude, ChatGPT, v0, Lovable, Bolt, Cursor

**What to listen for:**

- Unprompted positive language ("oh that would actually be useful") = strong signal
- Specific workflow integration mentioned ("I'd use this for weekly leadership updates") = stronger signal
- "Cool but I'd probably still use [their current tool]" = lukewarm signal — probe why
- Concerns about security, IT policy, sharing externally = real friction, note carefully
- Confusion about what the product does = the pitch needs work (this is on you, not them)

---

### Phase 5 — Willingness to pay (2 minutes)

**Goal:** Establish a price range, not a price.

> Last thing on the product side — if Zili worked exactly as I described, would you pay for it personally, or only if your company paid?

[Note answer.]

> If you'd consider paying yourself: there's a free tier with a small watermark on shared decks, or a Pro tier without the watermark plus a few power-user features. At what monthly price would Pro feel:
> - Cheap enough that you wouldn't think twice?
> - Reasonable — fair for the value?
> - Expensive — you'd consider, but hesitate?
> - Too expensive — you wouldn't pay?

[This is the Van Westendorp price-sensitivity technique. Note all four numbers.]

[If they ask the actual price: don't tell them yet. Say "I'm intentionally not sharing the price I'm considering — I want your raw read." Reveal at the very end of the call if they ask again.]

---

### Phase 6 — Close (1 minute)

> That's it — thank you, really. Two quick wrap-up things:
>
> First, anything you wish I'd asked but didn't?
>
> Second, would you be open to me coming back in a few months to show you a working version? No pressure either way.

[Note answer. Confirm gift card delivery method.]

> Gift card will arrive by [end of week / tomorrow]. Thanks again — this was genuinely helpful.

[Stop recording.]

---

## 6. Script — Independent consultants

**Total time: 30 minutes**
**Same structure as PM script. Differences below.**

The consultant context differs from PMs in three meaningful ways:

1. **They produce client-facing deliverables, not internal artefacts.** Polish matters more. Brand consistency matters more. The downside of looking unprofessional is real and personal.
2. **They bill for their time.** Cleanup time is literal money. The ROI math is sharper.
3. **They distribute externally** — clients open links from outside the consultant's domain. Security, trust, and brand control are more sensitive.

### Phase 1 — Warm-up (3 minutes)

**Same as PM script, but reframe the role question:**

> Briefly — what's your consulting focus? Solo, or do you work with a small team? How many active clients do you typically have at once?

> How often would you say you produce a polished deliverable for a client — a deck, recommendation memo, strategy doc, framework?

### Phase 2 — Current workflow (8 minutes)

**Same anchor question:**

> Tell me about the last polished deliverable you made for a client. Walk me through how it came together.

**Additional probes specific to consultants:**

- How much of the visual design is on you vs. is it a templated approach?
- Do you reuse design assets across clients, or start fresh each time?
- How much time do you typically bill (or budget internally) for the "polish" step vs. the thinking?
- Have you ever sent a client something less polished than you'd like because of time pressure?

### Phase 3 — Pain & workarounds (8 minutes)

**Same probes, plus consultant-specific:**

- When you've used an LLM to draft something for a client, did you tell the client? Why / why not?
- Has the client ever noticed (or commented on) the formatting / polish of an LLM-drafted artifact?
- How do you handle brand consistency across deliverables — your own brand, or your client's?
- Have you ever had a client ask "can I edit this?" after you sent something? What happened?

### Phase 4 — Concept reveal (8 minutes)

**Same script, with one adjustment in the reveal copy:**

After describing Zili, add:

> One thing specifically for consultants — there'd be a Pro tier that removes Zili branding from the shared link, gives you a custom URL slug, and (in a later release) lets you use your own domain. So the client experience can look like it's coming from you, not from us.

**Probes:**

- How would this fit into your client delivery flow?
- Does the "shared link" model fit how your clients typically receive deliverables, or do they expect PDF / PPTX attachments?
- Would you trust an external service like this with client material? What would you need to see to trust it?

### Phase 5 — Willingness to pay (2 minutes)

**Same Van Westendorp approach. Additional probe:**

> Some consultants think about tools like this as a business expense and would expense $30, $50, even $100/month if it saved them billable hours. Others see it as a personal-productivity tool and treat it like any subscription. Where do you sit?

### Phase 6 — Close (1 minute)

Same as PM script.

---

## 7. Post-interview synthesis

**Time required: 15 minutes immediately after each interview.** Do this *before* the next interview, while details are fresh. Skipping this step is the single biggest research mistake.

Fill out this template in your notes doc per interview:

```
INTERVIEW: [Date] · [Initials] · [PM / Consultant]
DURATION: [actual minutes]
RECRUITMENT SOURCE: [where they came from]

--- HYPOTHESIS SCORING ---

H1 — Weekly+ LLM artifact generation?
  [Yes / No / Unclear] — quote/note: "[exact wording if memorable]"

H2 — Pain ≥30 min per artifact AND ≥7/10 severity?
  Time estimate: [X min]
  Severity rating: [X/10]
  Quote: "[exact wording if memorable]"

H3 — Tried ≥2 workarounds and remain unsatisfied?
  Workarounds tried: [list]
  Current state: [satisfied / tolerating / actively seeking alternative]

H4 — Concept resonates ≥7/10?
  Rating: [X/10]
  First-reaction quote: "[exact wording]"
  Concerns raised: [list]

H5 — Willingness to pay $10–15/month?
  Cheap: $[X]
  Reasonable: $[X]
  Expensive: $[X]
  Too expensive: $[X]
  Personal pay vs. company pay: [their stated preference]

--- QUALITATIVE NOTES ---

Most surprising thing they said:
  "[quote or summary]"

What I learned about their world I didn't know before:
  [1-3 lines]

Killer quote (best soundbite, even if not directly about hypotheses):
  "[quote]"

Did the concept resonate, in one word?
  [Indifferent / Curious / Interested / Excited]

Would I bet money on this person becoming a paying customer?
  [Yes / Maybe / No] — why?

--- INTEGRITY CHECK ---

Did I lead them at any point?
  [Yes / No] — if yes, flag which answers to discount

Did I pitch before problem validation was complete?
  [Yes / No]

Was the recruit a personal-network bias (likely too friendly)?
  [Yes / No]

--- FOLLOW-UPS ---

Should I send the gift card? [Yes / No]
Did they ask to see the product later? [Yes / No]
Any introductions they offered? [list]
```

---

## 8. Cross-interview synthesis

**Run this once after the 10th interview.** Allow a full 2-hour session.

### Step 1 — Hypothesis tally (30 minutes)

For each hypothesis, count outcomes across all 10 interviews:

| Hypothesis | Confirms | Disconfirms | Unclear | Verdict |
|---|---|---|---|---|
| H1 (weekly+ usage) | / 10 | / 10 | / 10 | Pass / Fail / Unclear |
| H2 (≥30min, ≥7/10 pain) | / 10 | / 10 | / 10 | Pass / Fail / Unclear |
| H3 (≥2 workarounds, unresolved) | / 10 | / 10 | / 10 | Pass / Fail / Unclear |
| H4 (concept ≥7/10) | / 10 | / 10 | / 10 | Pass / Fail / Unclear |
| H5 (willing to pay $10–15) | / 10 | / 10 | / 10 | Pass / Fail / Unclear |

**Pass = 6+ confirm. Fail = 4+ disconfirm. Unclear = neither.**

### Step 2 — Segment analysis (30 minutes)

Re-run the hypothesis tally splitting by PMs vs consultants. Differences here are important — Zili might pass for one segment and fail for the other. That changes positioning.

### Step 3 — Pattern extraction (30 minutes)

Look across the qualitative notes for:

- **Recurring language** — what words and phrases came up unprompted? (This becomes marketing copy.)
- **Recurring workarounds** — what are people doing today that Zili replaces?
- **Recurring objections** — what concerns came up 3+ times? (These need product or messaging answers.)
- **Recurring use cases** — what specific workflows came up 3+ times? (These shape the demo / examples.)
- **Recurring "I'd love it if..." asks** — what features were repeatedly volunteered? (These inform V1.5 / V2 priority.)

### Step 4 — Killer quotes (15 minutes)

Pull out 5–10 quotes that capture the pain or the resonance in the user's own words. These will appear in pitch decks, marketing site copy, internal comms, investor updates. Pre-attribute (with permission) where possible.

### Step 5 — Decision (15 minutes)

See the decision framework in §9 below.

---

## 9. Decision framework — what to do with the findings

After cross-interview synthesis, use the table below to decide what comes next.

| Outcome | Interpretation | Action |
|---|---|---|
| **All 5 hypotheses pass** | The wedge is real. Engineering scoping proceeds as planned. | Proceed to Sprint 1. Bank the killer quotes for marketing. |
| **H1–H4 pass, H5 fails** | Real problem, right solution, but pricing/monetisation is wrong. Maybe a free tool, maybe priced differently, maybe B2B not B2C. | Don't change V1 build. Re-test pricing with a different mechanism (paywall test on landing page). Don't ship paid until you find a model. |
| **H1–H3 pass, H4 fails** | Real problem, but Zili's specific solution doesn't land. The render-and-share approach isn't the right wedge. | Pause. Reconvene on positioning. Talk to 5 more users with a different concept framing before building. |
| **H1–H2 pass, H3 fails** | Real problem, but users have already solved it well enough — the workaround is sticky. | Reconsider whether the pain is sharp enough to drive switching. Look for a sharper underserved segment. |
| **H1 passes, H2 fails** | Right cohort, wrong pain. They use LLMs for presentations but don't experience the cleanup pain at the level you assumed. | Narrow the cohort definition. Maybe it's not all PMs — it's PMs doing >5 presentations/month, or only consultants. Re-screen and re-test. |
| **H1 fails** | Wrong cohort. The frequency assumption is wrong. | Stop. Re-think who the target user is from scratch before any further work. |
| **Mixed pass/fail across PMs and consultants** | Asymmetric fit. Zili works for one segment, not the other. | Drop the failing segment from V1. Ship to the winning segment with sharper positioning. |

---

## 10. Anti-patterns — what not to do

A checklist of common research errors. Re-read this before every interview.

### During recruitment

- **Don't recruit only from your personal network.** Friends are too kind and too biased. Aim for ≥50% recruits outside your direct network.
- **Don't skip the screener.** "I'll just talk to anyone" produces noise.
- **Don't book 60-minute interviews.** No one runs them well. 30 minutes forces discipline.

### During the interview

- **Don't lead.** "Wouldn't it be great if..." is contamination.
- **Don't pitch early.** Reveal the concept after problem validation is complete. Earlier reveal primes every later answer.
- **Don't argue.** If they say something that contradicts your assumption, take notes, don't push back. Their reality wins.
- **Don't accept generalities.** "I make a lot of decks" → "When was the last one? Walk me through it." Specific past instances > generic claims.
- **Don't fill the silence.** Pauses are where the honest answers live.
- **Don't ask "would you use this?"** Ask "the last time you had this problem, what did you do?"
- **Don't take notes during the most important moments.** Listen fully. Write the moment they finish.

### During synthesis

- **Don't synthesize in one batch at the end.** Per-interview synthesis within 15 minutes is non-negotiable.
- **Don't average ratings without examining outliers.** A single 2/10 from a power user matters more than three 7/10s from casual users.
- **Don't ignore disconfirming evidence.** Your hypotheses can be wrong. That's the point.
- **Don't conflate "they were polite" with "they liked it."** A 7/10 with no follow-up question is weaker than a 5/10 with "but if it did X, I'd be in."
- **Don't stop at 10 interviews if the picture is unclear.** Run 5 more with refined recruiting.

### After synthesis

- **Don't shelf the findings.** Re-read them weekly during the build. The killer quotes belong on the wall behind your monitor.
- **Don't over-rotate on one interview.** Patterns across 10 > vivid story from 1.
- **Don't skip the consultant segment if PMs validate first.** Both segments need to pass independently to validate the full V1 positioning.

---

## Appendix A — One-page interview cheatsheet

Print this. Have it visible during the interview.

```
PHASE TIMINGS (30 min total)
  Warm-up         3 min   →  Role, frequency, set the tone
  Workflow        8 min   →  Last presentation, walk me through it
  Pain            8 min   →  Time estimate, severity 1-10, workarounds
  Reveal          8 min   →  Describe Zili, ask first reaction
  Pricing         2 min   →  Van Westendorp ladder (4 prices)
  Close           1 min   →  Anything you wish I'd asked?

THE FIVE THINGS I AM MEASURING
  H1: Weekly+ LLM presentation use?           [Y/N]
  H2: ≥30 min cleanup, ≥7/10 pain?            [X min, X/10]
  H3: Tried ≥2 workarounds, still unsolved?   [Y/N]
  H4: Concept resonates ≥7/10?                 [X/10]
  H5: Pay $10-15/month?                        [$X cheap/reasonable/expensive/too much]

THE FIVE THINGS I MUST NOT DO
  ✗ Lead them
  ✗ Pitch before pain is established
  ✗ Argue when they disagree
  ✗ Accept "I make lots of decks" without a specific last-instance
  ✗ Fill silences

THE ONE QUESTION I MUST ASK
  "Tell me about the last [presentation / deliverable] you made."
```

---

## Appendix B — Tracking sheet template

Maintain this as a spreadsheet across all interviews.

| # | Date | Initials | Segment | Source | H1 | H2 time | H2 score | H3 | H4 score | H5 cheap | H5 reasonable | H5 expensive | H5 too much | Killer quote | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | PM | | Y/N | min | /10 | Y/N | /10 | $ | $ | $ | $ | "..." | |
| 2 | | | Cons | | | | | | | | | | | | |
| ... | | | | | | | | | | | | | | | |
| 10 | | | | | | | | | | | | | | | |

---

*This script is the source of truth for validation. Update versions as you learn what doesn't work in practice. Treat the script as a working document, not scripture.*
