# TODOs

Deferred items captured during the GitHub-publish review. Each entry: what / why / pros / cons / context.

---

### 1. Capture and embed screenshots in README

**What.** Take 5-6 screenshots of the live app (login, onboarding, draft mid-generation, generated
draft, voice profile / settings, optional research-brief page) and embed in `README.md` under
the Walkthrough section.

**Why.** Public README is meaningfully better with visuals. The current text-only walkthrough
describes the flow accurately but doesn't show the polish (heartbeat progress bar, inline edit
affordances, brand typography).

**Pros.** Better first impression; easier to evaluate the product without cloning; visible
proof the system works end-to-end.

**Cons.** ~10-15 min of work. Screenshots go stale as UI evolves — need to be willing to
re-capture every few months.

**Context.** Decided to defer in the initial-publish review (`/plan-eng-review`) because the
README is functionally complete without them and the publish was time-boxed. `docs/screenshots/`
directory is already created.

---

### 2. Reconcile `tamaria-app` vs `talaria-app` naming inconsistency

**What.** Pick one of the two Firebase Hosting site names defined in `firebase.json` (lines 24
and 52), delete the other, and update `functions/src/handlers/runDraft.ts:22` so the hardcoded
`https://talaria-app.web.app` matches whichever survives. Also remove the `TAMARIA_PUBLIC_BASE_URL`
env-var fallback (or `TALARIA_*`, depending which name wins).

**Why.** The `firebase.json` currently deploys to both hosting sites under the same Firebase
project. This is a leftover from a mid-build rename (`tamaria` → `talaria`). It works but it's
confusing, double-bills hosting bandwidth, and makes the `RESEARCH_SITE_BASE` URL fragile.

**Pros.** Removes long-standing tech debt; simplifies deploy; one canonical URL.

**Cons.** Renaming a Firebase Hosting site requires DNS update if a custom domain points at
the deprecated one. ~30 min + propagation wait.

**Context.** Surfaced during `/plan-eng-review` for the public-README PR. Out of scope for
that PR (would have required infra change unrelated to publishing). Repository directory is
`tamaria` for now; brand and GitHub repo name are `talaria`.

---

### 3. Genericize firm-specific references in product code

**What.** Make the firm name configurable per-user instead of hardcoded as "Insight Partners"
in 5 places:
- `web/src/app/(app)/onboarding/page.tsx:44`
- `web/src/components/notebook.tsx:192`
- `shared/src/types.ts:250`
- `functions/src/_shared/types.ts:250`
- `functions/src/prompt.ts:29` and `:34`

Move to a `firmName` field on the user document (already present in `voiceProfile.firmInfo` —
just stop hardcoding the default).

**Why.** Currently the public repo's product code names a specific firm in the system prompt
and UI defaults. Anyone forking the repo to use Talaria for their own firm would need to
edit code in 5 places. A `firmInfo` field already exists for this purpose; it's just not
wired through.

**Pros.** Repo becomes properly forkable. Removes "this looks like a tool for one specific
person" feel.

**Cons.** Requires a migration: existing users with empty `firmInfo` need a sensible default.
Adds an onboarding step ("what's your firm name?").

**Context.** Surfaced during the public-README scrub. The docs (PLAN.md, REVIEW.md) were
genericized to "the firm"; product code wasn't (out of scope for the publish PR).

---

### 4. Add CI: typecheck + build on PR

**What.** GitHub Actions workflow at `.github/workflows/ci.yml` that runs `npm install` +
`npm run build` (which builds shared + functions + web) on every PR to main.

**Why.** Public repo means strangers may open PRs. Cheap insurance that PRs at least typecheck
and build before review. Also gives a green checkmark on PRs which signals the project is
maintained.

**Pros.** Catches build regressions before merge; minimal effort to add (~20 min); free on public
repos.

**Cons.** Need to think about secrets (the build doesn't need `ANTHROPIC_API_KEY`, but if tests
get added later that hit Firebase emulators, this gets more complex).

**Context.** Surfaced during `/plan-eng-review`. Not blocking the initial publish.
