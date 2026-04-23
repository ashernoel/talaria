<!-- /autoplan restore point: /Users/ashernoel/.gstack/projects/tamaria/main-autoplan-restore-20260420-141158.md -->

# Tamaria — Outreach Email & Research Assistant (VC/PE)

Plan authored: 2026-04-20
Author: Asher Noel
Status: Draft, pending /autoplan review

---

## 1. Problem

Asher writes many cold outreach emails to founders, CEOs, and board members. Each email needs personalization ("why this company specifically"), credibility ("we've studied your space"), and relevance ("here's why we're a fit right now"). Today: all manual. Each email takes 15-25 minutes. Quality varies with energy and time-of-day.

Followups are tracked in Salesforce but writing a followup still means reading the SF log, remembering context, and composing from scratch. Salesforce is a passive record, not an assist.

Target pain: reduce time-per-email from ~20 minutes to ~3 minutes, while raising floor-quality (no "energy-dependent" drafts) and improving response rate via a deep-research PDF attached to the outbound email.

## 2. Goal (vision)

One input: a company URL (optionally a Salesforce log paste, optionally user notes). One output: a personalized email draft in the user's voice, plus a 2-page deep-research PDF on the company and its space, stylized in the company's brand colors, ready to attach.

The system learns from every edit and approval the user makes. Over 20-50 drafts, the system's voice converges to the user's voice.

## 3. Success metrics

- Time-per-email: 20 min → 3 min (target at 10 approved drafts)
- Approve-without-edit rate: >40% at 20 approved drafts
- Reply rate lift: +X pp vs historical baseline (establish baseline first)
- User reports "this sounds like me" on 3/5 drafts at week 4

## 4. Users & scope

V1 user: Asher only, self-hosted install.
V2+ users: other investors at the firm (multi-tenant, per-user voice).
Not in scope V1: public launch, Chrome Web Store listing, billing.

## 5. Core features

**F1. Email drafting loop.**
Input: URL (required), Salesforce log text (optional), free-text notes (optional).
Process: scrape company site + recent news, retrieve user's last N approved drafts as few-shot examples, generate draft via LLM.
Output: draft email (subject + body). User approves, edits (inline), or rejects.
Learning: edit is stored as a `(before, after, reason?)` tuple. Approval is stored as a high-confidence training signal.

**F2. Deep research PDF.**
Input: same URL.
Process: multi-step agent pipeline that produces a structured document: company summary, market space (size, trends, recent activity), competitive landscape (3-5 named competitors), recent news (last 90 days), firm-relevant angle (how does this fit our thesis). Rendered as 2-page PDF, styled with colors extracted from the company's site.
Output: downloadable PDF from the extension, ready to attach to the outbound email.
Reference quality bar: https://gridbottlenecks.fyi/research (user to provide this URL's content to the research team as calibration data).

**F3. Learning loop.**
All approved emails + edit history retrieved by semantic similarity at draft-time. Top K (5-10) injected into the prompt as few-shot examples. Voice profile (tone, signature, firm info) persists as a small JSON doc updated on significant edits.

## 6. V1 scope (minimum shippable)

**Surface decision (premise gate resolved):** V1 ships as a **web app** (not Chrome extension). Chrome extension comes in Phase 3 where it actually earns its keep (scraping the Salesforce page via content script). User opens `localhost:3000` or `tamaria.app`, pastes URL, gets draft. Rationale: extension-icon UX is not worth the MV3 complexity tax for a single-user V1 with no Salesforce scraping yet.

IN V1:
- Web app (Next.js or Vite + React) with single-page popup-style UI
- Google Sign-In via Firebase Auth (single user: Asher)
- URL-only email drafting (F1 core path, no SF integration yet)
- Onboarding: paste 5-10 past emails to bootstrap voice profile
- Edit/approval logging to Firestore
- **Regenerate-with-feedback** button: "close but make it more X, less Y" captures nuanced training signal (premise gate cherry-pick)
- LLM: **Claude Opus 4.7** via backend proxy (Firebase Cloud Function), using Asher's existing `ANTHROPIC_API_KEY` injected at Function deploy

OUT of V1 (deferred by phase):
- F2 Deep research PDF → Phase 2 (includes brand colors, see premise P3)
- Salesforce paste-log context → Phase 3a
- Salesforce API integration → Phase 3b (gated on the firm's IT approval)
- **Chrome extension wrapper → Phase 3** (pairs with SF scraping)
- CEO email lookup → Phase 4
- Multi-user / sharing → V2
- Templates library (EOB1, "3-week followup", etc.) → Phase 4
- Reply-rate baseline measurement (premise gate: declined; revisit if Phase 2 impact becomes ambiguous)
- Reject-with-reason signal (premise gate: declined)

## 7. Premises (to challenge in /autoplan review)

**P1. ~~Chrome extension is the right surface.~~ RESOLVED: Web app V1, Chrome extension Phase 3.**
Premise gate decision: V1 ships as web app. Chrome extension deferred to Phase 3 where it pairs with Salesforce scraping (its actual unique value-add). Skips MV3 complexity tax for V1.

**P2. The deep-research PDF meaningfully lifts response rates.**
Rationale: founders value effort signal; investor-prepared research is rare.
Unverified: no A/B baseline. A founder might open a strong 3-sentence email and ignore an attached PDF. The PDF may matter mostly for founder's *opinion of us*, not reply-rate.
Risk: spending weeks on PDF pipeline that drives 0-5% of actual outcome.

**P3. Brand-color PDF personalization IS in scope, calibrated against `gridbottlenecks.fyi/research`.**
Premise gate decision: keep brand-color personalization. Reference quality bar = the PDFs produced by `gridbottlenecks.fyi/research`. User note: "those PDFs are looking pretty good as a starting point but some of the colors could be a bit better" — so tamaria must match or slightly exceed that reference. Phase 2 work: (a) visually audit the reference PDFs as calibration data, (b) document what "better colors" means concretely before coding the extraction pipeline, (c) build extraction + rendering with output-quality QA built in (reject bad palettes, fall back to clean template).

**P4. Voice learning from edits converges within a useful timeframe.**
Rationale: LLMs pick up tone from few-shot examples (5-15 approved emails).
Risk: single-user, sparse data. The Asher-at-midnight and Asher-at-10am draft different emails. Learning may oscillate.
Mitigation: explicit voice-prompt (user-authored description of self) plus few-shot, not few-shot alone.

**P5. CEO email lookup is feasible and ethical.**
Rationale: many public patterns (`firstname@company.com`).
Risks: GDPR/CCPA for EU/CA contacts; the firm's investor relations policy; hitting the wrong person by pattern-guessing.
Default stance V1: no lookup. "Here's the company general contact. Add the CEO email manually." Phase 4 revisits with Hunter.io or similar licensed service.

**P6. Salesforce integration is necessary for V1.**
Rationale: followup context lives in SF.
Alternative: V1 uses pasted-text SF log (user copies SF activity block and pastes into extension). No OAuth, no API, no IT approval needed. Gets 80% of value at 10% of complexity.
Recommended: ship paste-log for V1, pursue API integration in parallel track.

**P7. Personal Firebase project is acceptable storage for firm comms.**
Rationale: personal tool, Asher-controlled.
Risks: the firm's InfoSec/Legal may consider firm outreach data (including Salesforce-derived info) covered by data handling policy, even in a personal project. This is a blocker if not answered. Could require: local-only storage (IndexedDB in extension, no Firebase) or firm-hosted backend.
**OPEN BLOCKER**: confirm with the firm's IT before Firebase code is written.

## 8. Architecture

### Component diagram

```
V1 (Web app):
┌──────────────────────────────────────────────────┐
│  Web app (Next.js 14, App Router)                │
│  ─ / (home, sign-in)                             │
│  ─ /draft  (URL input, draft display, actions)   │
│  ─ /onboarding  (paste bootstrap emails)         │
│  ─ /settings  (voice profile, templates)         │
└──────────────────────┬───────────────────────────┘
                       │ HTTPS, Firebase Auth token
                       ▼
┌──────────────────────────────────────────────────┐
│  Backend (Firebase Cloud Functions, Node 20)     │
│  ─ POST /draft-email                             │
│  ─ POST /regenerate-with-feedback                │
│  ─ POST /research-doc             (Phase 2)      │
│  ─ POST /log-edit                                │
│  ─ POST /voice-profile                           │
└────┬──────────────────┬──────────────────┬───────┘
     │                  │                  │
     ▼                  ▼                  ▼
┌──────────┐   ┌──────────────────┐  ┌─────────────┐
│ Claude   │   │ Firestore        │  │ Firebase    │
│ API      │   │ users/           │  │ Storage     │
│ Opus     │   │ users/{uid}/     │  │ research-   │
│ 4.7      │   │   drafts/        │  │ pdfs/       │
│          │   │   voiceProfile   │  │             │
│ + search │   │   bootstrap      │  │             │
└──────────┘   └──────────────────┘  └─────────────┘

Phase 3 (add Chrome extension):
  + Extension (MV3) calls SAME backend
  + Content script adds Salesforce page scraping
```

### Data flow (F1: email draft)

1. User clicks extension icon → popup opens
2. Pastes URL, optionally SF log text + notes → clicks "Draft"
3. Popup → `POST /draft-email {url, salesforceLog?, notes?}` with Firebase Auth token
4. Backend:
   a. Fetch + parse company site (title, meta description, hero copy, team page if findable)
   b. Fetch last 90 days of news about the company (search API: Brave or Tavily)
   c. Retrieve user's voice profile + top-5 semantically similar approved drafts from Firestore
   d. Compose prompt (system = voice profile, few-shot = past approvals, user = current context)
   e. Call Claude; return {subject, body, confidence, sourcesConsulted}
5. Popup renders draft in editable textarea, with "Approve / Edit / Reject" buttons
6. On user action → `POST /log-edit {draftId, finalText, action}`
7. Backend writes to `users/{uid}/drafts/{draftId}`, updates voice profile if significant edit

### Data model (Firestore)

```
users/{uid}
  ├─ email, displayName, createdAt
  ├─ voiceProfile: { tone, signatureClose, firmInfo, explicitPrefs }
  └─ bootstrapComplete: bool

users/{uid}/bootstrap/{emailId}    // paste-in at onboarding
  ├─ subject, body, recipient (optional)
  └─ submittedAt

users/{uid}/drafts/{draftId}
  ├─ companyUrl, companyName (extracted), companyDomain
  ├─ generatedAt, generatedSubject, generatedBody
  ├─ finalSubject, finalBody
  ├─ action: 'approved' | 'edited' | 'rejected'
  ├─ editDiff: {subjectDiff, bodyDiff}  // unified diff, if edited
  ├─ sourcesConsulted: [{url, summary}]
  └─ salesforceContext?: string

users/{uid}/researchDocs/{docId}   // Phase 2+
  ├─ companyUrl, companyName
  ├─ structuredData: {summary, market, competitors, news, thesis}
  ├─ pdfStoragePath    // Firebase Storage ref
  ├─ brandColors: {primary, secondary, accent}
  └─ userComments: [{ts, text}]
```

### Auth & secrets

- Chrome extension gets Firebase Auth ID token via Google Sign-In
- Token passed as `Authorization: Bearer <token>` to Cloud Functions
- Cloud Functions verify token via Admin SDK
- Claude API key lives in Cloud Function env (never in extension)
- No BYOK for V1 (simpler UX, Asher bears the cost ~$0.02/draft at Sonnet 4.6 pricing)

## 9. Phases

| Phase | Scope | Target | Shippable |
|-------|-------|--------|-----------|
| 1 | F1 core path (web app): URL → draft → edit/approve/regenerate-with-feedback. Firebase Auth. Bootstrap onboarding. | Week 2 | Yes, usable by Asher |
| 2 | F2 Deep research PDF **with brand colors** (calibrated to gridbottlenecks.fyi/research). Fallback to clean firm template on bad palette extraction. | Week 4-5 | Yes |
| 3a | Salesforce paste-log context in F1 prompt | Week 6 | Enhancement |
| 3b | **Chrome extension wrapper** around web app; content script scrapes SF page | Week 6-7 | Enhancement |
| 3c | Salesforce API integration (if IT approved) | Parallel track | Gated |
| 4 | CEO email lookup, templates library, voice-profile refinement | Week 8+ | V1.0 candidate |

Phase 1 is the risk-reduction phase. Phases 2-4 are additive.

## 10. Risks

**R1. the firm's IT/compliance blocker.**
Personal Firebase project storing firm outreach data (and Salesforce-derived context) may violate the firm's data policy. This is an open blocker.
Mitigation: email the firm's IT/InfoSec this week. If blocked: pivot to (a) local-only IndexedDB storage in extension, no Firebase; or (b) firm-hosted backend with their auth stack.

**R2. LLM cost.**
Claude Sonnet 4.6 at ~$0.003/1k input, ~$0.015/1k output. Email draft with 8-shot retrieval + scrape context ~= 5k in, 500 out = ~$0.025/draft. Research PDF with multi-step agent = ~$0.50-2 each. Personal scale: fine. Team scale (V2): $1-3/user/day in aggregate, needs revisit.

**R3. Voice learning is sparse-data problem.**
10 bootstrap emails + 20 approved drafts = 30 examples. Fine for tone, weak for nuanced content preferences. Mitigation: explicit user-authored voice prompt (one paragraph: "I'm direct, I close with 'best', I lead with the 'why now'").

**R4. Deep research quality bar.**
"Like gridbottlenecks.fyi/research" is a high bar. V1 Phase 2 delivers clean template + real data, not visual parity with reference. Parity pursued in Phase 2b+.

**R5. CEO email accuracy / harm.**
Wrong email → wrong person → reputation hit for user and firm.
Stance V1: do not guess. Defer to Phase 4 with Hunter.io-class licensed service.

**R6. Chrome extension distribution friction.**
MV3 permissions, service-worker quirks, iteration cycle.
Stance V1: sideload (`chrome://extensions/` → Load Unpacked). Web Store listing deferred.

**R7. Reference site availability.**
`gridbottlenecks.fyi/research` may be user-owned or third-party. If unavailable, we lack calibration data for PDF quality. Need user to confirm access/rights.

## 11. Open questions (require user answers before build)

Q1. Has the firm's IT approved personal Firebase for firm outreach data? (blocker)
Q2. Does Asher have Salesforce API access, or export/paste-only? (determines Phase 3 path)
Q3. BYOK for Claude API (user provides key) vs Asher-pays-centrally? V1 default: centrally paid, single user.
Q4. Voice target: Asher personally, or the firm's house style? (affects voice profile default content)
Q5. Followup trigger: auto-detect from Salesforce log that a prior email was sent, or manually user-initiated?
Q6. Is `gridbottlenecks.fyi/research` user-authored (can crib template) or third-party inspiration only?
Q7. "Members of the board if CEO doesn't reply": how is this signaled? Manually enter board member URL, or auto-escalate after N days?

## 12. Explicit non-goals (out of scope for V1 and V2)

- Automated sending (draft always goes to clipboard / copy paste, user sends manually from Outlook/Gmail)
- Calendar / scheduling
- Salesforce writeback (log the email back into SF)
- Mobile app
- Response tracking / reply parsing
- Non-English drafting
- Team-shared voice / cross-user learning

## 13. Acceptance criteria (V1 Definition of Done)

- [ ] Extension loads in Chrome via `chrome://extensions/ → Load Unpacked`
- [ ] Google sign-in works, creates Firestore user doc on first login
- [ ] Onboarding flow captures 5+ bootstrap emails and a voice-prompt paragraph
- [ ] URL input → draft email rendered in popup within 15s at p95
- [ ] Draft quality: Asher approves-without-edit on ≥3 of 5 real-world test drafts (subjective)
- [ ] Every edit saved to Firestore with diff
- [ ] 10th draft shows visible influence from prior edits vs 1st draft (qualitative, user-judged)
- [ ] No firm-sensitive data leaves environment Asher controls (verified against the firm's IT's answer to Q1)
- [ ] `.env` secrets not committed (verified via `git log` check)
- [ ] README with setup + load instructions

## 14. Tech stack summary

- Frontend (V1 web app): Next.js 14 (App Router) or Vite + React 18, TypeScript, TailwindCSS
- Frontend (Phase 3 extension): Manifest V3, TypeScript, Vite + CRXJS, shares React components with web app
- Backend: Firebase (Auth + Firestore + Cloud Functions + Storage), Node 20, TypeScript
- LLM: **Anthropic Claude Opus 4.7** (model ID `claude-opus-4-7`), using Asher's existing `ANTHROPIC_API_KEY` injected at Cloud Function deploy time (`firebase functions:secrets:set ANTHROPIC_API_KEY`)
- Search: Brave Search API or Tavily (for recent news)
- PDF: Puppeteer on Cloud Functions (Phase 2) with brand-color pipeline calibrated to `gridbottlenecks.fyi/research`
- Package manager: pnpm workspaces (monorepo)
- Repo layout:
  ```
  tamaria/
    web/              (V1: Next.js web app)
    extension/        (Phase 3: Chrome extension, shares /shared)
    functions/        (Firebase Cloud Functions)
    shared/           (types + schemas + React components shared across)
    PLAN.md
    REVIEW.md         (/autoplan output)
    README.md
  ```

## 15. Concrete next steps (post-approval)

1. Email the firm's IT re: Q1 (personal Firebase for firm data). Block until answered.
2. Create Firebase project `tamaria-app` + enable Auth (Google), Firestore, Functions, Storage
3. Scaffold `extension/` (Vite + React + TS + CRXJS)
4. Scaffold `functions/` (Firebase TS template)
5. Wire up `POST /draft-email` with stub Claude call, hardcoded test URL, no retrieval yet
6. Build popup UI: sign-in, URL input, draft display with edit/approve/reject
7. Add bootstrap onboarding flow
8. Add retrieval: voice profile + top-5 drafts at prompt time
9. Live-use on 3 real companies, measure draft approval rate
10. Iterate
