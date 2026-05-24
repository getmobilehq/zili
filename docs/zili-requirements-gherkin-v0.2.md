# Zili V1 — End-to-end requirements

**Format:** Behavior-driven (Gherkin). Each capability is one Feature; each Feature contains Scenarios that describe user-observable behavior in the Given / When / Then form.

**Scope:** V1 must-haves and the explicit V1 should-haves from the PRD. V1.5+ items are out of scope.

**Conventions:**
- Each Feature begins with a *role / want / so that* preamble for context.
- `Background` blocks capture state shared by every Scenario in the Feature.
- Concrete data is used wherever possible (file names, sizes, slugs) — placeholders are bracketed.
- Error paths and edge cases are explicit, not implicit.

---

## Table of contents

1. [Cross-cutting (non-functional) requirements](#0-cross-cutting-requirements)
2. [Glossary](#glossary)
3. [Feature: User authentication](#feature-1--user-authentication)
4. [Feature: Artifact upload](#feature-2--artifact-upload)
5. [Feature: Artifact rendering & mode detection](#feature-3--artifact-rendering--mode-detection)
6. [Feature: Slide-mode presentation](#feature-4--slide-mode-presentation)
7. [Feature: Document-mode presentation](#feature-5--document-mode-presentation)
8. [Feature: Mobile presentation](#feature-6--mobile-presentation)
9. [Feature: Public sharing](#feature-7--public-sharing)
10. [Feature: Library management](#feature-8--library-management)
11. [Feature: Launch promo & pricing state](#feature-9--launch-promo--pricing-state)
12. [Feature: Admin — user management](#feature-10--admin--user-management)
13. [Feature: Admin — content moderation & take-downs](#feature-11--admin--content-moderation--take-downs)
14. [Feature: Admin — billing operations](#feature-12--admin--billing-operations)
15. [Feature: Admin — analytics & observability](#feature-13--admin--analytics--observability)

---

## 0. Cross-cutting requirements

These hold across every Scenario below, even when not stated explicitly.

| ID | Requirement |
|---|---|
| NFR-PERF-01 | Shared link cold-load (no cache) completes in < 1s at the 75th percentile globally |
| NFR-PERF-02 | Upload-to-rendered-preview completes in < 5s for files ≤ 5MB |
| NFR-PERF-03 | Navigation between slides in present mode renders the next slide in < 100ms |
| NFR-SEC-01 | All uploaded HTML is rendered inside a sandboxed iframe with `sandbox="allow-scripts"` and **no** `allow-same-origin` |
| NFR-SEC-02 | CSP on the rendered iframe defaults to `default-src 'none'` with an explicit asset allow-list |
| NFR-SEC-03 | Uploaded HTML is statically scanned on ingest; known-malicious patterns reject the upload |
| NFR-A11Y-01 | All presenter chrome controls are keyboard-reachable in a logical tab order |
| NFR-A11Y-02 | Every interactive element meets WCAG AA contrast against its background |
| NFR-A11Y-03 | Presenter controls expose appropriate ARIA labels for screen readers |
| NFR-BROWSER-01 | Supported on the latest two major versions of Chrome, Safari, Firefox, Edge |
| NFR-MOBILE-01 | Shared-link viewing is fully responsive on viewports ≥ 320px wide |
| NFR-BRAND-01 | All UI conforms to the Editorial Minimal brand canvas (palette, type, spacing, motion) |

---

## Glossary

| Term | Definition |
|---|---|
| **Artifact** | A user-uploaded HTML file (and any associated assets in V1.5+) |
| **Slide mode** | Presentation mode where the artifact is segmented into discrete pages navigated one at a time |
| **Document mode** | Presentation mode where the artifact is rendered as a single scrolling document |
| **Slug** | The URL-safe identifier appearing in a shared link, e.g. `zili.xyz/p/{slug}` |
| **Watermark** | The "Made with Zili" branding shown on free-tier shared decks (post-promo only) |
| **Launch window** | The first 3 months after public launch, during which all features are free |
| **Grandfather cohort** | Users who sign up during the launch window |

---

## Feature 1 — User authentication

```gherkin
Feature: User authentication
  As a new visitor to Zili,
  I want to create an account and sign in,
  So that I can upload, present, and manage my own artifacts.

  Background:
    Given the Zili website is reachable at zili.xyz

  Scenario: Sign up with email and password
    Given I am a new visitor on the sign-up page
    When I enter "alex@example.com" as my email
    And I enter "correct horse battery" as my password
    And I click "Create account"
    Then a confirmation email is sent to "alex@example.com"
    And I am redirected to a "Check your email" page
    When I click the confirmation link in the email
    Then my account is activated
    And I am signed in
    And I land on my (empty) library

  Scenario: Sign up with Google
    Given I am a new visitor on the sign-up page
    When I click "Continue with Google"
    And I complete the Google OAuth flow as "alex@example.com"
    Then my account is created and activated immediately
    And I am signed in
    And I land on my (empty) library

  Scenario: Sign in with existing email and password
    Given I have an existing account "alex@example.com"
    And I am on the sign-in page
    When I enter my credentials correctly
    Then I am signed in
    And I land on my library

  Scenario: Reject sign-in with incorrect password
    Given I have an existing account "alex@example.com"
    And I am on the sign-in page
    When I enter the email correctly but the password incorrectly
    Then I see the error "Email or password is incorrect"
    And I remain on the sign-in page
    And no session is created

  Scenario: Sign out
    Given I am signed in
    When I click my avatar in the top-right
    And I click "Sign out"
    Then my session is destroyed
    And I am redirected to the marketing homepage

  Scenario Outline: Reject malformed email addresses on sign-up
    Given I am on the sign-up page
    When I enter "<email>" and click "Create account"
    Then I see the error "Enter a valid email address"
    And no account is created

    Examples:
      | email           |
      | alex            |
      | alex@           |
      | @example.com    |
      | alex example.com|
      | alex@example    |
```

---

## Feature 2 — Artifact upload

```gherkin
Feature: Artifact upload
  As a signed-in user with an LLM-generated HTML artifact,
  I want to upload it to Zili through any of three input methods,
  So that I can present and share it without losing fidelity.

  Background:
    Given I am a signed-in Zili user
    And I am on the "New Artifact" page

  Scenario: Upload an HTML file via drag-and-drop
    Given I have a local file "strategy.html" of size 240KB containing valid HTML
    When I drag the file onto the upload zone
    Then the upload zone shows an active state
    And an upload progress indicator appears
    And within 5 seconds the artifact is ingested
    And I am redirected to the artifact's detail view
    And the artifact appears in my library

  Scenario: Upload via "Choose file" button
    Given I have a local file "strategy.html" of size 240KB
    When I click "Choose file"
    And I select "strategy.html" in the system file picker
    Then the file is uploaded as if drag-and-dropped

  Scenario: Upload by pasting raw HTML
    Given I have copied valid HTML to my clipboard
    When I click the "Paste HTML" tab
    And I paste the HTML into the textarea
    And I click "Upload"
    Then the artifact is ingested within 5 seconds
    And the artifact appears in my library with title derived from the HTML <title> tag
    And if no <title> exists, the title defaults to "Untitled — {timestamp}"

  Scenario: Upload by URL
    Given I have a public URL "https://example.com/deck.html"
    When I click the "From URL" tab
    And I paste the URL
    And I click "Upload"
    Then the server fetches the URL within 10 seconds
    And the response is ingested as if it were a file upload
    And the artifact appears in my library

  Scenario: Reject file exceeding size limit
    Given I have a local file "huge.html" of size 11MB
    When I drag the file onto the upload zone
    Then I see the error "File exceeds the 10MB limit"
    And the file is not uploaded
    And my library is unchanged

  Scenario Outline: Reject unsupported file types
    Given I have a local file "<filename>"
    When I drag the file onto the upload zone
    Then I see the error "Only HTML files are supported in V1"
    And the file is not uploaded

    Examples:
      | filename       |
      | deck.pdf       |
      | deck.pptx      |
      | deck.docx      |
      | deck.md        |
      | image.png      |

  Scenario: Reject URL upload from an unreachable source
    Given I paste a URL that returns a 404
    When I click "Upload"
    Then I see the error "Could not reach that URL — check the link and try again"
    And no artifact is created

  Scenario: Reject HTML containing known-malicious patterns
    Given I attempt to upload HTML containing a script that matches a known-malicious signature
    When the ingest pipeline runs its security scan
    Then the upload is rejected
    And I see the error "This file failed our security scan and could not be uploaded"
    And the rejection is logged for review
```

---

## Feature 3 — Artifact rendering & mode detection

```gherkin
Feature: Artifact rendering and presentation mode detection
  As a user who has just uploaded an artifact,
  I want Zili to render it faithfully and infer the right presentation mode,
  So that I get a usable presentation without configuring anything.

  Background:
    Given I am a signed-in user
    And I have just uploaded an artifact

  Scenario: Render in a sandboxed iframe with full CSS fidelity
    Given my artifact uses CSS gradients, custom fonts, and grid layout
    When the artifact is rendered in present mode
    Then it appears visually identical to the source HTML rendered in a standard browser
    And it is hosted inside an iframe with sandbox="allow-scripts"
    And the iframe does not have allow-same-origin

  Scenario: Auto-detect slide mode from <section> tags
    Given my artifact contains 8 top-level <section> elements
    When the ingest pipeline analyses it
    Then presentation mode is set to "slides"
    And slide count is recorded as 8
    And each <section> becomes one slide

  Scenario Outline: Auto-detect slide mode from common conventions
    Given my artifact contains elements matching "<selector>"
    When the ingest pipeline analyses it
    Then presentation mode is set to "slides"
    And the matching elements become individual slides

    Examples:
      | selector                          |
      | section                           |
      | .slide                            |
      | .page                             |
      | [data-slide]                      |
      | div.aspect-video                  |
      | div[class*="aspect-[16/9]"]       |

  Scenario: Fall back to document mode when no slide signals are present
    Given my artifact has no <section>, .slide, .page, [data-slide], or aspect-ratio elements
    When the ingest pipeline analyses it
    Then presentation mode is set to "document"
    And slide count is recorded as 1
    And the artifact is rendered as a single scrollable view

  Scenario: User manually overrides detected mode
    Given my artifact was auto-detected as "document"
    And I believe it should be presented as slides
    When I open the artifact's detail view
    And I click the mode toggle "Switch to slides"
    Then the artifact is re-segmented using fallback heuristics
    And the new mode is persisted for this artifact
    And subsequent views (and shares) use the overridden mode

  Scenario: External assets from the allow-list load successfully
    Given my artifact references "https://cdn.tailwindcss.com" and "https://fonts.googleapis.com"
    When the artifact renders
    Then those assets load and apply
    And the rendered output uses the correct fonts and styles

  Scenario: External assets outside the allow-list are blocked
    Given my artifact references "https://untrusted-cdn.example.com/script.js"
    When the artifact renders
    Then the request to that origin is blocked by CSP
    And a non-blocking warning is shown to me on the detail page: "1 external resource was blocked for security"
```

---

## Feature 4 — Slide-mode presentation

```gherkin
Feature: Slide-mode presentation
  As a user with a multi-slide artifact,
  I want to navigate it as a slide deck,
  So that I can present it the way I intended.

  Background:
    Given I am viewing an artifact "Quarterly strategy" with 12 detected slides
    And presentation mode is "slides"

  Scenario: Open in present mode and see slide 1 of 12
    When I click "Present"
    Then I see slide 1 rendered full width
    And the presenter chrome shows "01 / 12"
    And the artifact title "Quarterly strategy" is shown in mono caps at the top

  Scenario Outline: Navigate forward with keyboard
    Given I am viewing slide <from> of 12 in present mode
    When I press "<key>"
    Then I am viewing slide <to> of 12
    And the slide counter updates to show "<display>"

    Examples:
      | from | key         | to | display |
      | 1    | ArrowRight  | 2  | 02 / 12 |
      | 1    | Space       | 2  | 02 / 12 |
      | 1    | PageDown    | 2  | 02 / 12 |
      | 5    | ArrowRight  | 6  | 06 / 12 |

  Scenario Outline: Navigate backward with keyboard
    Given I am viewing slide <from> of 12 in present mode
    When I press "<key>"
    Then I am viewing slide <to> of 12

    Examples:
      | from | key        | to |
      | 2    | ArrowLeft  | 1  |
      | 2    | PageUp     | 1  |
      | 12   | ArrowLeft  | 11 |

  Scenario: Cannot navigate past the last slide
    Given I am viewing slide 12 of 12
    When I press "ArrowRight"
    Then I remain on slide 12
    And no error is shown

  Scenario: Cannot navigate before the first slide
    Given I am viewing slide 1 of 12
    When I press "ArrowLeft"
    Then I remain on slide 1

  Scenario: Enter fullscreen with F key
    Given I am in present mode and not in fullscreen
    When I press "F"
    Then the browser enters fullscreen
    And the presenter chrome remains visible but recedes
    And the artifact occupies the full screen

  Scenario: Exit fullscreen with ESC
    Given I am in fullscreen present mode
    When I press "Escape"
    Then the browser exits fullscreen
    And I remain on the same slide

  Scenario: Slide transition is instant and crisp
    When I navigate from slide 4 to slide 5
    Then the new slide renders in less than 100ms
    And there is no fade or animation between slides
    And the previously rendered slide is unmounted from the DOM

  Scenario: Speaker view opens in a separate window (should-have)
    Given my artifact contains speaker notes as <aside class="notes"> inside each section
    When I press "S" in present mode
    Then a new window opens displaying:
      | Element              | Content                                    |
      | Current slide        | The current slide, scaled down             |
      | Next slide preview   | The next slide, scaled down further        |
      | Speaker notes        | The notes for the current slide            |
      | Elapsed timer        | Time since presentation started            |
    And the speaker window stays in sync with the main presentation window
```

---

## Feature 5 — Document-mode presentation

```gherkin
Feature: Document-mode presentation
  As a user with a single-page styled artifact (one-pager, report, scrollytell),
  I want to present and share it as a continuous document,
  So that the artifact's design is preserved without forced pagination.

  Background:
    Given I am viewing an artifact "Q2 product memo"
    And presentation mode is "document"

  Scenario: Open in present mode and see the full document
    When I click "Present"
    Then the artifact is rendered as a single scrolling page
    And the presenter chrome shows the artifact title in mono caps
    And no slide counter is shown
    And the page scrolls naturally with mouse wheel, touch, and keyboard

  Scenario Outline: Scroll with keyboard
    Given I am viewing the document
    When I press "<key>"
    Then the viewport scrolls "<direction>" by approximately one page

    Examples:
      | key       | direction |
      | Space     | down      |
      | PageDown  | down      |
      | PageUp    | up        |
      | Home      | to top    |
      | End       | to bottom |

  Scenario: Enter and exit fullscreen
    Given I am viewing the document
    When I press "F"
    Then the browser enters fullscreen
    When I press "Escape"
    Then the browser exits fullscreen
    And my scroll position is preserved
```

---

## Feature 6 — Mobile presentation

```gherkin
Feature: Mobile presentation
  As a recipient of a shared link viewing it on my phone,
  I want the presentation to work smoothly on touch and small viewports,
  So that I can review the deck or document on the go.

  Background:
    Given I have opened a shared link on a mobile device with viewport width 390px

  Scenario: Swipe forward through a slide deck
    Given the artifact is in slide mode with 12 slides
    And I am viewing slide 1
    When I swipe left across the artifact
    Then I am viewing slide 2
    And the slide counter updates to "02 / 12"

  Scenario: Swipe backward through a slide deck
    Given I am viewing slide 2
    When I swipe right across the artifact
    Then I am viewing slide 1

  Scenario: Tap edges to navigate
    Given I am viewing slide 4 of 12
    When I tap the right 25% of the artifact area
    Then I advance to slide 5
    When I tap the left 25% of the artifact area
    Then I return to slide 4

  Scenario: Slides scale to viewport while preserving aspect ratio
    Given the artifact was authored at 1920×1080
    And I am viewing on a 390px-wide viewport
    Then each slide is scaled to fit the viewport width
    And the aspect ratio is preserved
    And the slide is letterboxed if necessary (no content cropping)

  Scenario: Document mode scrolls naturally on mobile
    Given the artifact is in document mode
    When I scroll with touch
    Then the document scrolls smoothly
    And no horizontal scroll appears unless the artifact itself requires it
```

---

## Feature 7 — Public sharing

```gherkin
Feature: Public sharing
  As an artifact owner,
  I want to generate a public link and an embed code for my artifact,
  So that I can distribute it to my audience without requiring them to sign in.

  Background:
    Given I am a signed-in user
    And I own an artifact "Quarterly strategy" with 12 slides

  Scenario: Generate a public share link
    Given the artifact has no share link yet
    When I open the artifact detail page
    And I click "Generate share link"
    Then a unique slug is generated, e.g. "qx7-quarterly-strategy"
    And the share URL "zili.xyz/p/qx7-quarterly-strategy" is shown to me
    And I can click "Copy" to copy it to my clipboard

  Scenario: Anonymous visitor opens a shared link
    Given a public share link "zili.xyz/p/qx7-quarterly-strategy" exists
    When an anonymous visitor opens the URL
    Then the visitor sees the artifact in present mode
    And the visitor does not need to sign in
    And the visitor cannot see my account information

  Scenario: Open Graph preview card for a shared link
    Given a public share link "zili.xyz/p/qx7-quarterly-strategy" exists
    When a third-party platform fetches the URL for an unfurl (e.g. Slack, X, LinkedIn, iMessage)
    Then the response includes Open Graph tags with:
      | Tag             | Value                                          |
      | og:title        | "Quarterly strategy"                           |
      | og:description  | "Shared with Zili. 12 slides."                 |
      | og:image        | A 1200×630 generated card matching brand canvas |
      | og:type         | website                                        |
      | og:url          | The canonical share URL                        |
    And the og:image follows the brand-canvas OG card design (warm ink background, display serif title, mono metadata)

  Scenario: Owner copies embed code
    Given I am viewing an artifact's share settings
    When I click "Copy embed code"
    Then my clipboard contains an iframe snippet:
      """
      <iframe src="https://zili.xyz/p/qx7-quarterly-strategy/embed"
              width="100%" height="540"
              allow="fullscreen"
              style="border: 1px solid #ECE9E0; border-radius: 6px;"></iframe>
      """
    And visiting the /embed URL renders the artifact without Zili presenter chrome
    And the embed includes a small "Made with Zili" link in the corner (post-promo, free tier)

  Scenario: Owner revokes a share link
    Given a public share link exists for my artifact
    When I click "Revoke link" on the artifact's share settings
    And I confirm the action
    Then the URL "zili.xyz/p/qx7-quarterly-strategy" returns a 404 page
    And the 404 page is branded with Zili's editorial minimal styling

  Scenario: Slug collision is avoided
    Given another user has already taken the slug "quarterly-strategy"
    When I generate a share link for an artifact that would normally produce "quarterly-strategy"
    Then the generated slug includes a short random prefix or suffix to ensure uniqueness
    And I do not see the other user's content

  Scenario: Pro users can set a custom slug (post-promo)
    Given I am on the Pro plan
    When I open share settings for my artifact
    And I edit the slug to "q2-strategy"
    And I click "Save"
    Then the share URL becomes "zili.xyz/p/q2-strategy"
    And any prior slug for this artifact returns a 301 redirect to the new slug

  Scenario: Anonymous viewer sees a "Get Zili" CTA on shared decks
    Given an anonymous visitor is viewing a public share link
    When the presentation loads
    Then a small, non-blocking "Made with Zili — zili.xyz" element appears in the bottom-right of the chrome (free tier post-promo only)
    And the element links back to the Zili marketing site
    And the element does not appear in fullscreen mode
    And the element does not appear on Pro/Studio-tier shared decks

  Scenario: Anonymous viewer reports abusive content
    Given an anonymous visitor is viewing a public share link
    When they click the "Report" link in the share footer
    Then a lightweight modal opens with a reason picker:
      | Reason                            |
      | Spam or misleading                |
      | Hate speech or harassment         |
      | Sexual or violent content         |
      | Copyright violation (DMCA)        |
      | Other                             |
    And they can optionally provide their email and a short note
    When they submit the report
    Then a report record is created and queued for admin review
    And the visitor sees a confirmation: "Thanks — we review every report"
    And the visitor's IP is captured for abuse-of-the-report-system prevention

  Scenario: Anonymous viewer of a revoked link sees a branded 404
    Given a share link was revoked or the artifact deleted
    When an anonymous visitor opens the URL
    Then they see a branded "This presentation isn't available" page
    And the copy does not imply wrongdoing by the owner
    And a CTA invites them to "Create your own with Zili"
```

---

## Feature 8 — Library management

```gherkin
Feature: Personal artifact library
  As a signed-in user,
  I want to view and manage all artifacts I have uploaded,
  So that I can return to, update, or remove my work.

  Background:
    Given I am a signed-in user
    And I have 6 uploaded artifacts in my library

  Scenario: View library as a grid
    When I navigate to "/library"
    Then I see all 6 artifacts as cards in a responsive grid
    And each card shows:
      | Element           | Detail                                   |
      | Thumbnail         | Auto-generated preview                   |
      | Title             | Editable, derived from <title> or filename |
      | Slide count       | e.g. "12 SLIDES"                         |
      | Last updated      | Relative time (e.g. "2H AGO")            |
      | Share status      | "Shared" badge if a public link exists   |

  Scenario: Open an artifact from the library
    When I click on an artifact card
    Then I am taken to its detail view
    And I can present, share, rename, delete, or re-upload from there

  Scenario: Rename an artifact
    Given I am on an artifact's detail view
    When I click the title
    And I change it to "Quarterly strategy — final"
    And I press Enter (or click outside the field)
    Then the new title is persisted
    And the library reflects the new title within 1 second
    And shared links continue to work (titles do not affect URLs)

  Scenario: Re-upload to update an existing artifact
    Given I am on an artifact's detail view
    When I click "Re-upload"
    And I upload a new HTML file
    Then the artifact content is replaced with the new file
    And the share URL is preserved
    And the slide count and mode are re-detected
    And anyone with the link sees the updated version on next page load
    And the previous version is not retained (V1 — version history is V2)

  Scenario: Delete an artifact
    Given I am on an artifact's detail view
    When I click "Delete"
    And I confirm by typing the artifact title and clicking "Delete permanently"
    Then the artifact is removed from my library
    And any share links to it return a 404
    And the underlying file is purged from object storage within 24 hours

  Scenario: Library cap warning on the free tier (post-promo)
    Given I am on the Free tier
    And my library cap is 25 artifacts
    And I have 24 artifacts in my library
    When I upload a new artifact
    Then the upload succeeds
    And I see a notice "You're 1 artifact away from your free-tier cap. Upgrade to Pro for unlimited storage."

  Scenario: Library cap reached on the free tier (post-promo)
    Given I am on the Free tier
    And my library cap is 25 artifacts
    And I have 25 artifacts already
    When I attempt to upload a new artifact
    Then the upload is blocked
    And I see "You've reached your free-tier cap of 25 artifacts. Upgrade to Pro to continue."
    And an "Upgrade" CTA is shown
    And no charge for upgrading occurs without my explicit confirmation
```

---

## Feature 9 — Launch promo & pricing state

```gherkin
Feature: Launch promo and pricing state
  As Zili the business,
  I want pricing rules to behave correctly across the launch window, the grandfather window, and the steady state,
  So that early users feel taken care of and the watermark growth loop kicks in cleanly post-launch.

  Background:
    Given the public launch occurred on a known date "LAUNCH_DATE"
    And the launch window covers LAUNCH_DATE through LAUNCH_DATE + 90 days
    And the grandfather window covers LAUNCH_DATE + 90 days through LAUNCH_DATE + 120 days

  Scenario: User signing up during the launch window
    Given today is within the launch window
    When a new user "alex@example.com" creates an account
    Then "alex@example.com" is marked as a grandfather-eligible user
    And all features are available to them
    And no watermark appears on their shared decks
    And their library has no cap

  Scenario: Grandfather upgrade offer surfaces near end of launch window
    Given I signed up during the launch window
    And today is LAUNCH_DATE + 60 days (30 days before window ends)
    When I sign in
    Then I see a one-time banner: "Early access ends in 30 days. Lock in 50% off Pro for life."
    And I can dismiss the banner
    And the banner reappears at LAUNCH_DATE + 75 days and LAUNCH_DATE + 85 days

  Scenario: Grandfather user upgrades within the grandfather window
    Given I am grandfather-eligible
    And today is within the grandfather window
    When I upgrade to Pro
    Then I am charged $6/month (50% of $12)
    And this discounted price is locked for the lifetime of my account
    And the discount is shown on my billing settings

  Scenario: Grandfather user lets the grandfather window expire
    Given I am grandfather-eligible
    When the grandfather window ends without me upgrading
    Then my account converts to Free tier
    And from this point forward, my shared decks show the Zili watermark
    And my library cap is enforced going forward (existing artifacts remain accessible)
    And future Pro upgrades are at the full $12/month price

  Scenario: New user signing up after the launch window
    Given today is after the launch window
    When a new user creates an account
    Then they are placed on the Free tier
    And shared decks they create carry the Zili watermark
    And their library cap is 25 artifacts
    And Pro upgrades are at the full $12/month price

  Scenario: Watermark appears on free-tier shared decks
    Given a free-tier user has a public share link
    When an anonymous visitor views the link
    Then a small "Made with Zili — zili.xyz" element appears in the bottom-right of the presenter chrome
    And the same wordmark appears on the Open Graph preview card
    And the watermark links back to zili.xyz

  Scenario: Watermark is removed when user upgrades to Pro
    Given my account upgrades from Free to Pro
    When I view my own shared decks (or anonymous visitors view them)
    Then no watermark appears on any deck
    And the Open Graph preview cards are regenerated without the watermark within 5 minutes
```

---

## Feature 10 — Admin: user management

```gherkin
Feature: Admin user management
  As the Zili operator,
  I want to view, search, and manage user accounts,
  So that I can support customers, handle abuse, and apply manual corrections.

  Background:
    Given I am signed in to the Zili admin surface (e.g. Retool, admin.zili.xyz)
    And I have the "operator" role
    And the admin surface is protected by 2FA and IP allow-listing where applicable

  Scenario: Find a user by email or name
    When I enter "alex@example.com" in the user search
    Then I see the user's profile within 1 second, showing:
      | Field                  | Detail                                         |
      | Email                  | alex@example.com                               |
      | Sign-up date           | YYYY-MM-DD                                     |
      | Current plan           | Free / Pro / Studio                            |
      | Grandfather status     | Eligible / Locked-in / Not eligible            |
      | Artifact count         | Total uploaded                                 |
      | Total shared views     | Across all their share links                   |
      | Last activity          | Last sign-in or upload date                    |
      | Suspension status      | Active / Suspended (with reason and date)      |

  Scenario: Suspend a user account
    Given I am viewing a user's profile
    When I click "Suspend account"
    And I provide a reason from a structured list (Abuse / DMCA / Payment fraud / Other)
    And I optionally add free-text notes
    And I confirm the action
    Then all of the user's active sessions are invalidated
    And the user cannot sign in until reinstated
    And all of their public share links return a branded "This presentation isn't available" page
    And the suspension and reason are recorded in the admin audit log

  Scenario: Reinstate a suspended user account
    Given I am viewing a suspended user's profile
    When I click "Reinstate"
    And I optionally add notes about the resolution
    And I confirm
    Then the user can sign in again
    And their share links are reactivated
    And the reinstatement is recorded in the audit log

  Scenario: Manually grant grandfather status (edge case)
    Given a user signed up shortly after the launch window ended due to a referral they received within the window
    When I view their profile
    And I click "Grant grandfather status"
    And I provide a reason and confirm
    Then their account is flagged grandfather-eligible
    And they become eligible for the 50% lifetime Pro discount
    And the action is recorded in the audit log

  Scenario: Manually revoke grandfather status
    Given a user has grandfather status that I need to remove (e.g. abuse, misuse)
    When I view their profile
    And I click "Revoke grandfather status"
    And I provide a reason and confirm
    Then their grandfather eligibility is removed
    And any existing locked-in discount continues to apply (legal/goodwill — discount not clawed back) unless I explicitly tick "Also remove locked-in discount"
    And the action is recorded in the audit log

  Scenario: Delete a user account (GDPR request)
    Given a user has submitted a verified deletion request
    When I view their profile
    And I click "Delete account permanently"
    And I confirm by typing the user's email and clicking "Delete"
    Then within 30 days:
      | Action                                                                   |
      | All user records in the application database are purged                  |
      | All uploaded artifacts are deleted from object storage                   |
      | All public share links to their artifacts return 404                     |
      | Their email is hashed and added to a do-not-recreate list (90 days)      |
      | Billing records are retained as required by financial regulation         |
    And the user receives a confirmation email
    And the deletion is recorded in the audit log

  Scenario: View admin audit log
    When I navigate to "Admin > Audit log"
    Then I see all admin actions in reverse chronological order, with:
      | Field          | Detail                              |
      | Timestamp      | Action time                         |
      | Actor          | Admin email                         |
      | Action         | Suspend / Refund / Take down / etc. |
      | Target         | User / Artifact / Share link        |
      | Reason         | Structured + free-text              |
    And the log is immutable — entries cannot be edited or deleted
    And I can filter by actor, action type, target, and date range
```

---

## Feature 11 — Admin: content moderation & take-downs

```gherkin
Feature: Admin content moderation and take-downs
  As the Zili operator (or moderator),
  I want to review flagged content and remove abusive material,
  So that Zili remains safe, compliant, and trusted.

  Background:
    Given I am signed in to the admin surface
    And I have the "operator" (or "moderator") role

  Scenario: Review the security-scan rejection queue
    Given the ingest pipeline has rejected uploads for security violations in the last 7 days
    When I navigate to "Admin > Security > Rejected uploads"
    Then I see each rejected upload, sortable by date, with:
      | Field             | Detail                                          |
      | User email        | The uploader                                    |
      | Timestamp         | When the rejection occurred                     |
      | Rejection reason  | The specific pattern matched                    |
      | Sample            | A read-only, sanitized snippet of the content   |
    And I can mark each as "Confirmed malicious", "False positive", or "Needs further review"
    And confirmed-malicious entries auto-flag the user account for review

  Scenario: Review the abuse reports queue
    Given anonymous viewers have submitted abuse reports
    When I navigate to "Admin > Reports"
    Then I see all reports, sortable by date and severity, with:
      | Field              | Detail                                |
      | Reporter           | IP, and email if provided             |
      | Reported artifact  | Title, share URL, owner               |
      | Reason             | From the structured reason picker     |
      | Free-text note     | If provided                           |
      | Status             | Open / Triaged / Resolved             |
    And I can review the artifact directly from the queue
    And I can take action: Dismiss / Take down / Suspend account / Escalate

  Scenario: Handle a DMCA take-down request
    Given I have received a valid DMCA notice for the share URL "zili.xyz/p/qx7-strategy"
    When I navigate to that artifact in the admin panel
    And I click "Take down for DMCA"
    And I enter the complainant's name, contact, and the alleged infringement
    And I confirm
    Then the share link is revoked immediately
    And the artifact owner is emailed with the take-down notice, the complainant's contact, and counter-notice instructions
    And the artifact remains in the owner's library but cannot be re-shared without admin review
    And the action is recorded in the audit log with the DMCA paperwork attached

  Scenario: Counter-notice from artifact owner reinstates the share link
    Given an owner has submitted a valid DMCA counter-notice via email
    When I navigate to the affected artifact
    And I click "Reinstate after counter-notice"
    And I confirm
    Then the original share link is restored
    And the original complainant is notified
    And the action is recorded in the audit log

  Scenario: Add or remove an entry on the asset CSP allow-list
    Given I need to add "https://newcdn.example.com" to the allow-list
    When I navigate to "Admin > Security > Asset allow-list"
    And I click "Add origin"
    And I enter "https://newcdn.example.com" and provide a reason
    And I confirm
    Then the origin is added to the allow-list within 5 minutes
    And future ingest and renderer operations honor the updated list
    And the change is recorded in the audit log
```

---

## Feature 12 — Admin: billing operations

```gherkin
Feature: Admin billing operations
  As the Zili operator,
  I want to perform manual billing actions,
  So that I can handle refunds, comps, and billing edge cases without leaving the admin surface.

  Background:
    Given I am signed in to the admin surface
    And I have the "operator" role
    And Stripe is connected as the billing provider

  Scenario: Issue a refund within policy
    Given a user requests a refund within 7 days of being charged
    When I view their billing page
    And I click "Refund last charge"
    And I optionally edit the refund amount (defaults to full)
    And I provide a reason and confirm
    Then Stripe processes the refund within 60 seconds
    And the user receives an email confirmation from Stripe
    And the refund is recorded in the audit log

  Scenario: Grant a complimentary Pro subscription
    Given I want to comp a beta tester or friend
    When I view their profile
    And I click "Grant complimentary Pro"
    And I select a duration (1, 3, 6, or 12 months) and a reason
    And I confirm
    Then their account is upgraded to Pro for the chosen duration at $0
    And after the duration expires, the account reverts to Free unless they add a payment method
    And they receive an email notification explaining the comp and the reversion date
    And the comp is recorded in the audit log

  Scenario: Apply a custom discount code to a user
    Given I want to give a specific user a one-off discount
    When I view their profile
    And I click "Apply discount"
    And I enter a percentage (e.g. 30%) and a duration (e.g. 6 months)
    And I confirm
    Then the next 6 monthly charges are discounted by 30%
    And the user sees the active discount on their billing settings
    And the action is recorded in the audit log

  Scenario: View revenue dashboard
    When I navigate to "Admin > Revenue"
    Then I see, scoped to a date range:
      | Metric                          |
      | Total revenue                   |
      | MRR (monthly recurring revenue) |
      | ARR (annual recurring revenue)  |
      | New subscriptions               |
      | Cancellations                   |
      | Refunds issued                  |
      | Net new MRR                     |
    And I can export the data as CSV
```

---

## Feature 13 — Admin: analytics & observability

```gherkin
Feature: Admin analytics and observability dashboard
  As the Zili operator,
  I want to monitor product health, growth, and system performance,
  So that I can make informed decisions and respond to incidents.

  Background:
    Given I am signed in to the admin surface
    And the product analytics tool (PostHog or equivalent) is integrated
    And the error monitoring tool (Sentry or equivalent) is integrated

  Scenario: View the daily metrics dashboard
    When I navigate to "Admin > Metrics"
    Then I see real-time figures for:
      | Metric                                                      |
      | Daily / weekly / monthly active users (DAU, WAU, MAU)       |
      | New signups (today, this week, this month)                  |
      | Artifacts uploaded (today, this week)                       |
      | Shared deck views (today, this week)                        |
      | Free → Pro conversion rate (last 7d, last 30d)              |
      | Churn (last 7d, last 30d)                                   |
      | North-star: shared decks viewed per week                    |
    And I can filter by date range
    And I can export the data as CSV

  Scenario: View the activation funnel
    When I navigate to "Admin > Metrics > Activation"
    Then I see the funnel for a chosen cohort:
      | Step                                          |
      | Signups                                       |
      | % who uploaded an artifact                    |
      | % who generated a share link                  |
      | % whose share link received its first view    |
      | % who returned in week 2                      |
    And I can segment by acquisition source (organic, watermark referral, direct, etc.)
    And I can compare two cohorts side by side

  Scenario: View top-shared decks (anonymized)
    When I navigate to "Admin > Metrics > Top decks"
    Then I see the top 50 most-viewed shared decks in the last 30 days
    And each entry shows: anonymized owner, share URL, view count, unique viewers
    And I can use this to spot organic distribution wins and viral content
    And I cannot see deck contents from this view (privacy)
    And opening a deck from this view requires a separate "view content" click that is logged

  Scenario: View system health
    When I navigate to "Admin > Health"
    Then I see real-time status of:
      | Subsystem            | Indicators                          |
      | Ingest pipeline      | Success rate, avg duration, errors  |
      | Renderer service     | Cold-load time, error rate          |
      | Sharing edge cache   | Hit rate, p95 latency               |
      | Auth                 | Success rate, error rate            |
      | Stripe webhook       | Delivery success, retry queue depth |
    And I can drill into Sentry for full error traces
    And critical issues fire alerts to a configured channel (Slack, email, PagerDuty)

  Scenario: Send an in-product announcement to a cohort
    Given I want to notify the grandfather cohort about the upcoming discount lock-in deadline
    When I navigate to "Admin > Announcements"
    And I create a new banner with:
      | Field        | Detail                                                              |
      | Cohort       | Grandfather-eligible users who have not upgraded                    |
      | Headline     | "Lock in 50% off Pro — 14 days left"                                |
      | Body         | Short copy with CTA                                                 |
      | CTA target   | /pricing?from=grandfather-banner                                    |
      | Schedule     | Start now, end on grandfather-window-end-date                       |
    And I confirm
    Then matching users see the banner at the top of their dashboard
    And the banner is dismissible per user
    And clicks on the CTA are tracked for conversion measurement
    And the announcement is recorded in the audit log
```

---



## Appendix — Open requirements questions

These need product input before requirements are fully locked. They do not block the bulk of engineering work but should be answered before final QA sign-off.

1. **Title derivation precedence** — when an artifact has no `<title>`, do we prefer the first `<h1>` over a timestamp fallback? (Recommendation: yes, fall back to first `<h1>`, then timestamp.)
2. **Slug format** — short hash + slugified title (`qx7-quarterly-strategy`) or pure slugified title with collision suffixes (`quarterly-strategy-2`)? (Recommendation: short hash + slug, more shareable and harder to enumerate.)
3. **Speaker notes convention** — `<aside class="notes">` per slide, HTML comments `<!-- notes: ... -->`, or both? (Recommendation: support both; document both in user-facing help.)
4. **OG image generation** — generate on upload (cheap, fast) or on first social-platform fetch (lazy)? (Recommendation: on upload, regenerate on title change or upgrade/downgrade.)
5. **Revoked / deleted share link 404 page** — should it be branded with "this presentation has been removed" copy, or generic? (Recommendation: branded with subtle copy, no implication of wrongdoing.)
6. **Re-upload version history** — confirmed deferred to V2, but should we keep the previous version in cold storage for 30 days for "oops" recovery? (Recommendation: yes, soft delete with 30-day grace period.)
7. **Admin surface choice** — Retool, Internal, Forest Admin, or custom from day one? (Recommendation: Retool over Postgres + Stripe for V1. Custom is a V2+ investment.)
8. **Audit log retention** — 12 months, 24 months, or indefinite? (Recommendation: 24 months minimum, indefinite for legally significant actions like DMCA and GDPR deletions.)
9. **Operator 2FA enforcement** — required from day one or strongly recommended? (Recommendation: required, no exceptions.)
10. **Abuse-report rate limiting** — per-IP cap on abuse reports to prevent weaponized reporting (e.g. 5 reports per IP per 24h). (Recommendation: yes, with admin override visibility.)

---

*This document is the source of truth for V1 engineering and QA. Update via PR when scope or behaviour changes.*
