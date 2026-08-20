# AGENTS.md — AI Agent Guide

This file tells AI agents (GitHub Copilot, Claude, GPT, etc.) what each part
of this codebase is for, what conventions apply, and where to make changes.

---

## Project overview

**Digital CV of Giulio Occhipinti** — an interactive CV with two independent systems:

| Entry point    | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `cv-site/`     | Astro static site — the visual, interactive CV     |
| `src/index.ts` | MCP server (stdio) — AI tooling for CV data access |
| `src/http.ts`  | HTTP server (Hono) — REST API                      |

---

## CV Data — source of truth

| File                | Content                                              |
| ------------------- | ---------------------------------------------------- |
| `src/data/cv.ts`    | Full CV data in **Italian** — single source of truth |
| `src/data/cv.en.ts` | **English** translation — imports types from `cv.ts` |

Both export all CV sections: `personal`, `social`, `languages`, `experience`, `education`,
`certifications`, `technicalSkills`, `softSkills`, `transversalSkills`, `methodology`,
`growthAreas`, `projects`, `interests`, `socialImpact`, `aiWorkflow`, `valueFlows`, `feedbacks`.
The `Feedback` interface has: `name`, `role?`, `quote?`, `keywords[]`.

**Never change the type structure in `cv.ts` without updating `cv.en.ts` too.**

---

## Design system (cv-site/)

The site is a **Knolling / Flat Lay CV**: each element is an "object" laid out on a flat surface
like items in a knolling photograph.

**3 lenses** — each is an Astro route (`[lens].astro`), not a URL param:

| Route (IT) | Route (EN)    | Internal key | Persona                 | Accent                      |
| ---------- | ------------- | ------------ | ----------------------- | --------------------------- |
| `/design`  | `/en/design`  | `creative`   | Web & UX Designer       | Orange `rgba(255,107,53,1)` |
| `/tech`    | `/en/tech`    | `tech`       | Software Developer      | Cyan `rgba(0,255,200,1)`    |
| `/ai`      | `/en/ai`      | `human`      | AI & Digital Specialist | Gold `rgba(240,200,127,1)`  |

⚠️ **The URL slug is NOT the internal key, and must never be conflated with it.**
`creative` is served at `/design` and `human` at `/ai`. The keys appear ~427 times
across the repo — in `cv.ts`/`cv.en.ts`, in `[data-mode]` CSS rules, in
`exp-clusters.ts`, in `modeStore.ts`, in the tests. Renaming them to match a URL
would be a 400-site edit on data files for something no visitor ever sees. The
mapping lives in `LENS_SLUGS` / `MODE_BY_SLUG` / `lensPath()` in `cv-i18n.ts`, and
**that is the only place a URL is built**. `modeStore.ts` keeps a deliberate
2-line copy of the map (it is an island loaded on every page; importing the whole
i18n module for three word-pairs costs more than it saves) — change one, change
both.

All 3 lenses share the ottanio background `rgba(8,73,67,1)` — only `--color-accent`
changes. The lens changes visual emphasis only, never the template or structure.

Full spec → `cv-site/DESIGN.md`
Operative rules → `.vscode/design.instructions.md` (Copilot, auto-injected on `cv-site/src/**`) or `.claude/skills/design-system/SKILL.md` (Claude Code)

---

## Where to make changes

### Editing CV content

→ Edit `src/data/cv.ts` (Italian). Mirror changes in `src/data/cv.en.ts` (English).

### IT ↔ EN parity — copy AND structure

**The EN pages must differ from their IT counterparts in language only.**
Nothing else: not the order of elements, not the default state, not the
behaviour, not the logic that computes them.

→ **One component, two languages — this is now structural.** The entry page
  and the CV page are `components/HomeEntryPage.astro` and
  `components/CvLensPage.astro`, each taking a `locale` prop; the four routes
  (`index.astro`, `[lens].astro`, `en/index.astro`, `en/[lens].astro`) are
  8-line wrappers that pass nothing but the locale. **Do not fork them.** If a
  page needs to differ by language, the difference belongs in a string table,
  not in a second file. A condition inside a wrapper is a bug by construction.

→ **Copy lives in string tables, never in markup.** UI strings go in
  `LocaleStrings.ui` (`cv-i18n.ts`), voice copy in `lab-copy.ts`
  (`PROFILE_TEXT`, `ABOUT_TEXT`, `TAGLINE`), CV content in `cv.ts` / `cv.en.ts`.
  They are typed on purpose: a key missing in one language is a **compile
  error**, not a blank space discovered in production. If the text is
  personal/voice-heavy (bio, storytelling, wordplay), translate carefully to
  preserve tone and flag the translation to the user for review rather than
  treating it as final.

→ **`/work` and `/privacy` are still forked** (`work/` and `en/work/`,
  `privacy.astro` and `en/privacy.astro`). They predate the shared-component
  approach and remain the one place where IT/EN parity is held by discipline
  rather than by construction. Touching one means touching the other.

→ **Structure and behaviour.** The same applies to everything that is not
  text: DOM order of modes/cards/nav, which item is active or open by
  default, sort order, dropdown contents, interactive affordances. If a
  change makes IT and EN behave differently, it is a bug — fix both sides in
  the same session.

→ **There is no longer a "legitimate asymmetry".** Until 2026-08 the EN CV was
  a single static page with no lens in its path, and that exception was the
  source of a family of bugs (hero copy frozen on one persona, accordion opened
  on the wrong cluster, projects scored against the wrong mode). Both languages
  now have a lens in the URL and render from the same component. If you find
  yourself writing `=== "tech"` or `locale === "en" ? A : B` around anything
  other than a **path** or a **string**, stop: that is the old bug coming back.

→ **Changing the default lens touches several files at once.** Keep these in
  sync: `DEFAULT_MODE` in `cv-site/src/lib/cv-i18n.ts` and in
  `cv-site/src/scripts/cv-init.ts`, the fallbacks in
  `cv-site/src/islands/stores/modeStore.ts` (`getInitialMode` and `initMode`),
  and the `/cv` + `/en/cv` redirects in `cv-site/astro.config.mjs`.

### Adding a page or component to the site

→ Astro static components go in `cv-site/src/components/`
→ Lit interactive islands go in `cv-site/src/islands/`
→ Pages go in `cv-site/src/pages/`
→ Always follow `cv-site/DESIGN.md` for visual rules.

### Adding an MCP tool

→ Create `src/tools/<name>.ts`, export `register<Name>Tool(server)`, register in `src/tools/index.ts`.

### Adding an MCP resource

→ Create `src/resources/<name>.ts`, export `register<Name>Resource(server)`, register in `src/resources/index.ts`.

### Adding an MCP prompt template

→ Create `src/prompts/<name>.ts`, export `register<Name>Prompt(server)`, register in `src/prompts/index.ts`.

### Adding an HTTP route

→ Create `src/http/routes/<name>.ts`, export a `Hono` instance, mount in `src/http/app.ts`.
→ Add the route schema to `openApiPaths` in `src/http/app.ts`.

### Adding environment variables

→ Declare in `src/config/env.ts` (Zod schema), add to `.env.example`.

### Throwing HTTP errors

→ Use typed errors from `src/http/errors.ts` (`NotFoundError`, `ValidationError`, etc.).

### Adding tests

→ Create `src/<module>/<name>.test.ts`. Use `vitest`. See `src/http/app.test.ts` as example.

### Generating a targeted CV variant (job-application specific)

→ The `cv-recruiter` subagent (`.claude/agents/cv-recruiter.md`) takes a target
  country + a job description + company, audits for anomalies, computes a
  JD-match report (compatibility %, strengths, pain points, salary estimate),
  then writes a `Locale`-shaped JSON to `cv-output/targeted/<slug>.json` and
  runs `npm run pdf:targeted -- <path>` (`scripts/generate-targeted-cv.ts`) to
  render it — designed + ATS-draft PDF, always both, no parser-type branching
  — through the shared template in `scripts/cv-pdf-template.ts` (`Locale`
  type, `buildHtml`/`buildHtmlAts`, pure — no `fs`/Playwright, so the same
  module is safe to import from the serverless renderer below too). Both CLI
  scripts load font/QR assets via `scripts/load-pdf-assets.ts`
  (`readFileSync`, Node-only).
→ The subagent also logs each job description's key signals to
  `cv-output/jd-insights/<usa-canada|europa|italia>.md` so later variants for
  the same region get calibrated against real, accumulated patterns.
→ `cv-output/` is gitignored — these are personal application documents, never commit them.

### Same thing, from a phone — the Gemini-powered web tool

→ `cv-site/src/pages/tools/cv-recruiter.astro` is a private, unlinked, `noindex`,
  passphrase-gated page (excluded from the sitemap and disallowed in
  `public/robots.txt`) reachable from any device. Accepts country (required),
  company/job title (optional — Gemini identifies them from the JD/screenshots
  when left blank), job description as text and/or image uploads (screenshots
  of a posting — compressed client-side to fit Vercel's fixed 4.5MB function
  body limit), and posts to `cv-site/src/pages/api/cv-recruiter.ts`
  (`export const prerender = false` — the only non-static route on the site,
  a Vercel serverless function; see `adapter: vercel()` in
  `cv-site/astro.config.mjs`), which runs the same audit/JD-match logic as
  the `cv-recruiter` subagent but via the **Gemini API** (`@google/genai`,
  free tier) instead of Claude, in two calls: one with Google Search
  grounding for company/salary research, one with `responseSchema` for the
  structured CV+report JSON (Gemini can't combine search tools and
  `responseSchema` in the same call — see `cv-site/src/server/cv-recruiter/`).
  Both calls are multimodal — images go in as `inlineData` parts alongside
  text (`prompt.ts`).
→ After the structured JSON comes back, the route best-effort renders the
  PDFs server-side too (`cv-site/src/server/cv-recruiter/render-pdf.ts`,
  `playwright-core` + `@sparticuz/chromium`) and returns them as base64
  alongside the report — no more manual desktop step when it works. This is
  the least-verifiable part of the tool (real behavior depends on the Vercel
  plan's function size/duration limits, not fully testable outside a live
  deploy): `renderPdfs()` never throws, it returns `null` on any failure, and
  the route always still returns the report + downloadable JSON either way —
  the frontend shows PDF download buttons only when `pdf` isn't null, a
  "generate locally" note otherwise.
→ Font/QR assets for that renderer are precomputed at
  `generated/pdf-assets.json` (repo root, **outside** `cv-site/` on purpose —
  `scripts/gen-pdf-assets.mjs` regenerates it, rerun only if fonts/QR change).
  Keeping ~200KB of base64 as a `.ts`/`.js` module anywhere under `cv-site/`
  reliably OOMs `astro check` on a low-RAM machine, and tsconfig `exclude`
  doesn't stop the language server from scanning it anyway — moving the file
  fully outside the Astro project directory was the only fix that worked.
  `render-pdf.ts` gets it from `pdf-assets-loader.ts`, which imports it via
  the `@pdf-assets` Vite alias (`astro.config.mjs`) so the JSON is inlined
  into the function bundle at build time — **not** `fs.readFileSync` with an
  `import.meta.url`-relative path, which is what shipped first and broke
  production outright (real incident, 2026-08-05: every `/api/cv-recruiter`
  call 500'd). Two independent reasons a runtime read of this file can't
  work: `@vercel/nft`'s static trace never picked up the dynamically-built
  path and left the file out of the deployed bundle entirely, and even had
  it been included, `__dirname` at runtime resolves against the *bundled
  chunk's* location under `dist/server/chunks/`, several directories off
  from where the source-tree-relative `"../../../../generated/..."` math
  assumed it would land — esbuild flattens the module tree, so a path that's
  correct for the source layout isn't correct for the output layout. A build
  JSON import sidesteps both problems at once: no runtime file read is left
  to trace or mis-resolve. Verify by grepping a built function chunk under
  `.vercel/output/functions/_render.func/dist/server/chunks/` for
  `readFileSync` or `pdf-assets.json` — neither should appear.
  `astro.config.mjs`'s `includeFiles` for `@sparticuz/chromium`'s binaries is
  a separate, still-necessary mechanism (that's a real runtime file the
  packaged browser launches, not build-time data) — same underlying lesson
  though, that `@vercel/nft` doesn't expand globs, discovered by a real build
  failure.
→ It cannot write to the developer's local `cv-output/` — a serverless
  function has no access to that machine. It returns the report, the
  `Locale` JSON, and (when rendering succeeded) the PDFs in the HTTP response
  for the browser to download. The report also carries a `companyProfile`
  (§ below) and an `insightEntry` snippet — a "Salva voce in memoria" button
  posts that snippet to `api/cv-recruiter-insight.ts`, a second, separate
  serverless route that appends it to a **private Vercel Blob** store instead
  of the local `cv-output/jd-insights/*.md` (`insights-store.ts` — one blob
  per country bucket, deterministic pathname via `addRandomSuffix: false` +
  `allowOverwrite: true`, so each save reads, appends, and rewrites the same
  file; `access: "private"`, never `"public"`, because the content is
  personal application data — company names, salary estimates, gaps in
  Giulio's profile — and the `digital-cv` repo/deploy is public). Split into
  its own route on purpose: a failed save must never take down the CV/report
  that already generated successfully, and saving is an explicit user action
  (button click), not a side effect of every generation. This Blob store and
  the desktop `cv-output/jd-insights/` files are **not** synced with each
  other today — mobile-submitted insights land only in Blob, desktop-typed
  ones only on local disk; unifying them (e.g. the MCP tool below pulling
  from Blob before it writes) is a possible follow-up, not yet built.
→ `report.companyProfile`: a 2-4 sentence synthesis of the Google Search
  grounding findings (what the company does, sector, size/stage, culture,
  recent news/funding) — same call-2 structured-output step as
  `salaryEstimate`, same rule against inventing beyond what the grounding
  call actually returned, null when research wasn't available. Shown in its
  own report card client-side, and included in every `insightEntry`.
→ `result.coverLetter`: a cover letter tailored to the job description,
  generated in the same call-2 structured-output step as `cvContent` (same
  schema, same grounding-only rule — no invented achievements or metrics
  beyond what's in the CV data). Rendered as a fourth server-side PDF
  (`buildCoverLetterHtml` in `scripts/cv-pdf-template.ts` — plain single-column
  business-letter layout, not the knolling CV design) alongside designed/ATS,
  using sender contact details pulled from `cvGroundingData.personal`/`.social`
  (never invented — omitted from the letter if not present in the CV data,
  e.g. there's no phone number in `cv.ts` today). Shown as its own report card
  (readable text) plus a PDF download button when rendering succeeds; `null`
  gracefully skips just the cover letter, same as `companyProfile`, without
  affecting CV generation. The desktop `cv-recruiter` MCP tool saves it
  alongside the CV PDFs as `<slug>_Cover_Letter.pdf`; the Claude-powered
  subagent (`.claude/agents/cv-recruiter.md`) does not generate one today —
  that's a separate content-generation path this doesn't touch.
→ Requires 3 env vars server-side only for generation (`cv-site/.env.example`):
  `GEMINI_API_KEY`, `CV_TOOL_PASSPHRASE`, optional `GEMINI_MODEL`. The route
  fails closed (503) if either required var is unset — there is no
  "unauthenticated but open" state. `api/cv-recruiter-insight.ts` additionally
  needs `BLOB_READ_WRITE_TOKEN`, normally auto-injected by connecting a
  private Blob store to the project from the Vercel dashboard's Storage tab.
→ **Read env vars through `readEnv()` (`process.env` first, `import.meta.env`
  only as fallback), never `import.meta.env` directly.** Vite/Astro replace
  `import.meta.env.X` *statically at build time*: a var set in the Vercel
  dashboard after the last build stays `undefined` at runtime, and the
  endpoint answers 503 "non configurato" even though the dashboard shows it
  set. This was a real production symptom, not a hypothetical. Consequence
  for operations: **after changing an env var on Vercel you must redeploy**,
  and `process.env` is what makes the value visible to the running function.

Three failure modes found by testing this flow end to end — all three are
now handled, and the handling is the only reason the tool works on a free
Gemini key:

→ **Google Search grounding has its own quota, separate from the model's,
  and it can be zero on the free tier.** Verified: the identical request
  without `googleSearch` succeeds, with it returns 429 RESOURCE_EXHAUSTED.
  Since the grounding call ran first and was unguarded, *every* request
  ended in a 502 — the tool was fully unusable for what is only an
  accessory feature. It is now best-effort: on failure the flow continues
  with `NO_RESEARCH` (a prompt instruction, so the model does not
  compensate by inventing figures), `salaryEstimate` comes back null, and
  the response carries `researchAvailable: false` so the UI can say *why*
  the estimate is missing instead of implying none exists.
→ **`renderPdfs()` must never throw** — it returns `null` and the route
  still returns report + JSON. Proven in practice: local rendering failed
  (see below) and the request still returned 200 with the full report.
→ **Locally, `playwright-core` ships no browser** and the revision it looks
  for rarely matches the one the root `playwright` package installed.
  Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing Chromium to exercise
  the PDF path in `astro dev` (same convention as
  `scripts/generate-ux-cv.ts`). On Vercel this is irrelevant: `process.env.VERCEL`
  selects the `@sparticuz/chromium` binary instead.
→ The passphrase field is `type="password"`, and the form also carries a
  **visually hidden `autocomplete="username"` input**. Mobile password
  managers (iOS Safari, Chrome Android) associate a credential to a
  username+password *pair*; with a lone password field many never offer to
  save it — which defeats the whole reason that field is a password. It is
  hidden via `.visually-hidden` (1×1 clipped) rather than `display:none` or
  `hidden`, because password managers skip fields removed from layout.

### Calling the same tool from Claude Code — the `cv-recruiter` MCP tool

→ `src/tools/cv-recruiter.ts` lets Claude Code drive the exact same deployed
  Gemini flow above (`fetch` to `CV_TOOL_BASE_URL` + `/api/cv-recruiter`,
  `CV_TOOL_BASE_URL`/`CV_TOOL_PASSPHRASE` in root `.env.example`) instead of
  — or in addition to — the Claude-powered subagent. Unlike the browser, it
  runs on the developer's machine, so it closes the persistence gap noted
  above: it writes the JSON (and the PDFs, when the server returned them) to
  `cv-output/targeted/`, and appends `insightEntry` to
  `cv-output/jd-insights/<bucket>.md` itself. Takes local image paths
  (`imagePaths`) rather than base64 and reads/encodes them itself.

### Applications tracker — candidato / mail ricevuta / conferma CV / esito

→ `insightEntry` (above) only ever recorded *what was generated*, not what
  happened to it — and saving it was never automatic (a button on mobile, a
  tool run on desktop that, in practice, was never actually exercised for a
  real save). `cv-site/src/server/cv-recruiter/applications-store.ts` adds a
  second, structured store for exactly that gap: a single JSON ledger on
  Vercel Blob (`applications/ledger.json`, private, same read-modify-write
  pattern as `insights-store.ts` but updatable records instead of
  append-only text) tracking 4 fields per application — `applied`,
  `emailReceived`, `cvConfirmationReceived`, `outcome`
  (`pending`/`rejected`/`offer`/`ghosted`), each with a timestamp set
  automatically the first time it flips.
→ A ledger entry is created **automatically** by `api/cv-recruiter.ts` right
  after a CV generates successfully — no button to remember, unlike
  `insightEntry`. Creation is best-effort (try/catch around
  `createApplication`, same non-blocking contract as `renderPdfs`): a Blob
  failure here must never turn an otherwise-successful CV generation into an
  error response. The returned id is attached to `cv._meta.applicationId`.
→ Unlike `jd-insights` (deliberately split — Blob for mobile, local disk for
  desktop, not synced), the ledger uses **Blob as the single source of
  truth for both sides**: the mobile page and the desktop MCP tools call the
  same HTTP route, neither writes a local file. That's the point — Giulio
  needs to see the *same* status regardless of where he updates it.
→ `cv-site/src/pages/api/cv-recruiter-applications.ts`: one POST route
  (passphrase in body, never in query string, same as the other 2 routes),
  branching on `action: "list" | "update"`. `update` only accepts the 4
  status fields (`sanitizePatch` rejects anything else) and only mutates an
  existing record by id — it never touches company/role/matchPercentage.
→ `cv-site/src/pages/tools/applications.astro`: mobile page, same
  private/`noindex`/passphrase pattern as `cv-recruiter.astro` (and same
  `sessionStorage` key, so the passphrase doesn't need retyping). Lists every
  ledger entry with 3 tap toggles + an outcome dropdown, each PATCHing
  immediately. Linked from the CV generator's result view ("Le mie
  candidature") so it's reachable without memorizing the URL.
→ `src/tools/cv-applications-list.ts` / `src/tools/cv-applications-update.ts`:
  MCP equivalents, same `CV_TOOL_BASE_URL`/`CV_TOOL_PASSPHRASE` as
  `cv-recruiter.ts`, no new env vars. Two single-purpose tools rather than
  one with a mode switch, matching the rest of `src/tools/`.
→ **Gmail-assisted status check — on demand, not a background service.**
  When Giulio asks Claude Code to check on open applications: run
  `cv-applications-list`, take the records where `applied` is true and
  `outcome` is still `pending`, and for each one search Giulio's Gmail via
  the `claude.ai Gmail` connector (`search_threads`, query built from the
  company name plus confirmation/interview/rejection keywords, scoped
  `newer_than:` the application's `appliedAt`) for anything relevant.
  Summarize what turned up and **only call `cv-applications-update` after
  Giulio confirms** — never write a status change from an inferred email
  match without confirmation, a wrong guess writes a false status into data
  he relies on. This is intentionally session-triggered, not a scheduled
  job: a real always-on version would mean a server-side Gmail API
  integration on Vercel (OAuth app registration, refresh-token storage,
  cron) — a materially bigger and more credential-sensitive project than
  what "check when I ask" needs, so it wasn't built.

---

## Full file reference

```
src/                      ← MCP server + HTTP API (Node.js / TypeScript)
  index.ts                ← MCP entry point (stdio) — do not add HTTP here
  http.ts                 ← HTTP entry point (Hono) — do not add MCP here
  server.ts               ← McpServer factory — MCP wiring only
  config/env.ts           ← Zod-validated env vars
  data/
    cv.ts                 ← CV data IT (source of truth)
    cv.en.ts              ← CV data EN
  http/
    app.ts                ← Hono app factory + error handler + /openapi.json
    errors.ts             ← Typed HTTP error classes
    routes/               ← One file per feature route
      qr.ts               ← /api/qr — QR code generation (JSON base64, PNG, SVG)
  tools/index.ts          ← MCP tool registry
  tools/echo.ts           ← Example tool — copy as template
  tools/cv-recruiter.ts   ← Calls the deployed /api/cv-recruiter, saves JSON/PDF/cover letter + jd-insights locally
  tools/cv-applications-list.ts   ← Lists the applications ledger (candidato/mail/conferma CV/esito)
  tools/cv-applications-update.ts ← Updates one ledger entry's status by id
  resources/index.ts      ← MCP resource registry
  prompts/index.ts        ← MCP prompt template registry
  utils/logger.ts         ← stderr-only logger

cv-site/                  ← Astro site (the actual CV)
  DESIGN.md               ← Full visual system specification
  public/
    cv/                   ← Generated CV PDFs (IT + EN) — output of scripts/generate-cv-pdf.ts
    qr/                   ← Static QR codes for the site (light/dark, signature, card variants)
    photos/               ← Personal photos (trip/, belongings/) for the "About me" drawer
    knolling/             ← Knolling object images (webp)
    fonts/Lexend/         ← Preloaded 800-weight woff2 (font-display: block)
  src/
    pages/                ← Routes only. The two big pages live in components/ and
                            render both languages — see § "IT ↔ EN parity".
      index.astro         ← "/" — wrapper: <HomeEntryPage locale="it" />
      [lens].astro        ← /design /tech /ai — wrapper: <CvLensPage locale="it" />
      en/index.astro      ← "/en" — wrapper: <HomeEntryPage locale="en" />
      en/[lens].astro     ← /en/design /en/tech /en/ai — <CvLensPage locale="en" />
      work/index.astro    ← Case study index
      work/[slug].astro   ← Project case studies
      en/work/            ← English case studies (index.astro + [slug].astro)
      lab/hero.astro      ← Entry-page prototype still open, noindex. NOT dead code:
                            the /design-system panel documents its `lab-*` classes
                            and links to it. Deleting it breaks that panel.
      old-version/        ← The pre-2026-08 site, served but noindex: home.astro,
                            [mode].astro, en/home.astro, en/cv.astro. Kept so it can
                            be shown without rebuilding it from a commit; nothing
                            links to it from the live site, by design. Its internal
                            links stay inside /old-version.
                            Legacy redirects (/home /cv /creative /human /en/cv) are
                            NOT pages: they are declared in astro.config.mjs so the
                            adapter emits real 301s instead of meta-refresh pages.
      tools/cv-recruiter.astro ← Private, unlinked, passphrase-gated CV generator (see AGENTS.md § "from a phone")
      tools/applications.astro ← Private, unlinked, passphrase-gated applications ledger view (see AGENTS.md § "Applications tracker")
      api/cv-recruiter.ts ← The 3 server routes on the site (prerender = false) — Gemini-powered backend for the page above
      api/cv-recruiter-insight.ts ← Persists a JD-insight entry to private Vercel Blob, called by the "Salva voce in memoria" button
      api/cv-recruiter-applications.ts ← Lists/updates the applications ledger, called by tools/applications.astro and the 2 MCP tools above
    server/cv-recruiter/
      prompt.ts            ← Multimodal prompt building (text + image parts), audit/analysis rules
      schema.ts             ← Gemini responseSchema (structured JSON output) + matching TS types
      fixed-copy.ts          ← Fixed IT/EN boilerplate strings + country-bucket helpers, GDPR footer text
      render-pdf.ts           ← Best-effort server-side PDF render (playwright-core + @sparticuz/chromium), never throws
      pdf-assets-loader.ts     ← Imports generated/pdf-assets.json via the @pdf-assets Vite alias (build-time, see below) — not a runtime fs read
      insights-store.ts        ← Read-modify-write of a JD-insight blob per country bucket on private Vercel Blob storage
      applications-store.ts    ← Read-modify-write of the applications ledger (single JSON, all buckets) on private Vercel Blob storage
      http-helpers.ts           ← Shared readEnv (process.env-first)/jsonResponse, used by all 3 api/cv-recruiter*.ts routes
    components/           ← Static Astro components
      HomeEntryPage.astro ← The entry page ("/" and "/en") — takes `locale`, renders both
      CvLensPage.astro    ← The CV page (/design /tech /ai + /en/*) — takes `lens` + `locale`
      MemoryDrawers.astro ← "Fun fact / Belongings / Travel" drawers — takes `lang`
      ContactFooter.astro ← Shared contact footer
      WorkDesignSystem.astro ← Design system section inside /work case studies
      cards/              ← Reusable card components
        ExpCard.astro     ← Experience card (mode tags, impactScore, company logo)
        AiCard.astro      ← AI-enhanced workflow card (impactScore badge)
        ProjectCard.astro ← Project card (tech stack, links)
        SkillSquare.astro ← Skill square with glow (NO progress bars)
        SoftItem.astro    ← Soft / transversal skill item
        WorkIndexCard.astro ← Case study index card
    islands/              ← Lit interactive web components
      GoLogo.lit.ts       ← <go-logo>: animated logo, click = reset to /, mode-reactive color
      FloatingMenu.lit.ts ← <floating-menu>: FAB with contact/feedback links
      SkillForceGraph.lit.ts ← <skill-force-graph>: D3 force-directed skill network (lazy-loaded)
      stores/modeStore.ts ← NanoStore for global mode state (tech/creative/human)
    lib/
      cv-i18n.ts          ← Locale + Mode types, LENS_SLUGS/MODE_BY_SLUG/lensPath (URL ↔ key),
                            DEFAULT_MODE, and LocaleStrings — every UI string, both languages
      cv-view-model.ts    ← Shared page logic (clusters, skills, timelineItems, projects)
      lab-copy.ts         ← Voice copy in both languages: PROFILE_TEXT, ABOUT_TEXT, TAGLINE
      exp-clusters.ts     ← Shared experience-cluster definitions (IT/EN labels, exp+proj refs)
      work-knolling.ts    ← Which knolling object each case study gets, keyed by slug
    scripts/              ← Shared client-side logic (vanilla TS + GSAP)
      cv-init.ts          ← CV page init: mode switch, scroll, accordions, feedback carousel
      index-init.ts       ← Home init: preloader, knolling, mode cards, launch journey
      mode-helpers.ts     ← Pure mode-system functions (tested in mode-helpers.test.ts)
      work-journey.ts     ← /work page animations
      memory-drawer.ts    ← "About me" photo/story drawer (3D page-flip)
      intro-seen.ts       ← sessionStorage flag to skip the GO intro on return visits
    styles/
      global.css          ← CSS custom properties for the 3 lenses, reset, cursor, focus
      lab-cv.css          ← CV page styles (`lc-*`) — CvLensPage.astro
      lab-home.css        ← Entry page styles (`lh-*`) — HomeEntryPage.astro
      lab-hero.css        ← Prototype entry styles (`lab-*`) — lab/hero.astro
      work-page.css       ← /work page styles (`work-*`)
      cv-page.css         ← Styles for the old CV page — used only by /old-version
      index-page.css      ← Styles for the old home — used only by /old-version
    layouts/Layout.astro  ← Base layout (head/SEO/JSON-LD, fonts, Lenis, custom cursor, FAB)

scripts/                  ← Root utility scripts (Node)
  parse-cv.ts             ← Parse source CV data
  generate-cv-pdf.ts      ← Render the knolling CV to A4 PDFs with QR (npm run pdf:cv)
  cv-pdf-template.ts      ← Pure Locale type + buildHtml/buildHtmlAts/buildCoverLetterHtml (no fs/Playwright) — shared by every PDF renderer, CLI and serverless
  load-pdf-assets.ts      ← Reads font/QR from disk into a PdfAssets — Node CLI only, do not import from cv-site
  generate-ux-cv.ts       ← UX/UI CV, designed + ATS-draft (npm run pdf:ux) — owns the IT/EN Locale content, renders via cv-pdf-template.ts
  generate-targeted-cv.ts ← Renders one job-application-specific Locale JSON (npm run pdf:targeted -- <path>) — consumer of .claude/agents/cv-recruiter.md's output
  gen-pdf-assets.mjs      ← Regenerates generated/pdf-assets.json (rerun only if fonts/QR change — see AGENTS.md § "from a phone")
  gen-og-image.mjs        ← Generate the Open Graph image
  qa-mobile.js            ← Responsive QA via Playwright (npm run qa:mobile)
  qa-design-system.mjs    ← Deterministic gauntlet for /design-system, IT+EN (npm run qa:ds) — see § Verification loop
  qa-parity.mjs           ← IT ↔ EN structural parity on the real pages (npm run qa:parity)
  qa-links.mjs            ← No broken internal links, no page without its counterpart (npm run qa:links)
  qa-prepush.mjs          ← Builds, serves the build, runs the three above (npm run qa:prepush) — called by .husky/pre-push
  qa-units.mjs            ← No px outside 1/2/3 across cv-site/src (npm run qa:units) — see § Units
  record-demo-playwright.js ← Record the site demo video

.vscode/
  mcp.json                ← External MCP servers config (VS Code)
  design.instructions.md  ← Auto-injected on cv-site/src/** — design rules
  typescript.instructions.md ← Auto-injected on src/**/*.ts
  http.instructions.md    ← Auto-injected on src/http/**
  prompts/                ← Reusable /slash prompts

.github/
  copilot-instructions.md ← Always injected in every Copilot chat
  skills/                 ← Copilot skills (same domains as .claude/skills below)

.claude/
  agents/
    cv-recruiter.md       ← Subagent: audits + tailors a CV against a real job description (match %, gaps, salary estimate), generates a targeted CV variant (see scripts/generate-targeted-cv.ts)
  skills/                 ← Claude Code skills — mirrors .github/skills, loaded on demand
    knolling-cv/SKILL.md         ← Global project context — load FIRST for any request
    design-system/SKILL.md       ← UI, animations (Emil Kowalski rules), knolling, GSAP, CSS custom properties
    design-system/knolling-reference.png  ← Visual reference for knolling layout
    identity/SKILL.md            ← Bio, tone of voice, GO narrative, job hunting
    agile-methodology/SKILL.md   ← Agile, Lean, PM for SMBs, impactScore, sprints
    mcp-architecture/SKILL.md    ← MCP tools, Hono, cv.ts, tests, AI workflow
    partnership-strategy/SKILL.md ← Fractional partner, SMB consulting positioning
    caveman/SKILL.md             ← Utility skill — ultra-compressed response mode (/caveman)

.husky/
  pre-push                ← Runs `npm run lint && npm run format:check` before every push — see § Git hooks below

generated/
  pdf-assets.json         ← Font/QR precomputed base64 for the serverless PDF renderer — committed, regenerate via scripts/gen-pdf-assets.mjs. Deliberately outside cv-site/, see AGENTS.md § "from a phone"

.mcp.json                 ← Project-scoped MCP servers for Claude Code (mcp-base-template, sequential-thinking)
CLAUDE.md                 ← Claude Code entry point (imports this file, adds skill-loading + MCP notes)
AGENTS.md                 ← This file — tool-agnostic project guide
```

---

## Size scale — `--size-*`

→ A 4px grid in rem, declared in `global.css` beside the type scale. The
  number in the name is the px value, exactly as in `--fs-12`: a token is
  chosen by thinking "how much space", and in px that is known by heart —
  rem is how it is served, not how it is reasoned about.
→ `--size-2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64 · 80`.
→ It covers spacing **and** dimensions — padding, margin, gap, inset,
  offsets, and an element's own width/height: the width of a box and the
  padding inside it fall on the same grid, which is what makes it read
  right. Two boundaries hold: radii have their own tokens (`--radius-4`,
  `--radius-16`) and so does type (`--fs-*`) — a radius written with this
  scale would look interchangeable with a spacing value, and it is not.
  Negative offsets stay literal; `calc(var(--size-32) * -1)` is noisier
  than `-2rem` and buys nothing.
→ It covers 275 of the system's 398 spacing measures. The other 123 are rem
  values picked by eye (0.35 · 0.6 · 0.85 · 1.15…) — the same "noise" the
  type-scale comment warns about, left literal on purpose: snapping them to
  the grid changes the design, and that is a decision, not a substitution.

---

## Units — rem everywhere, px only for hairlines

→ Every measurement is in `rem`, anchored to a 16px root (there is no
  `font-size` on `html`, so 1rem = 16px). The only px allowed are **1, 2 and
  3**: those are border widths and one-pixel shadows — device pixels, not
  typographic measures. A border that grows with the text becomes a bar.
  Everything else in px is a measure that does not grow with the text it sits
  next to at 200% zoom, which is where the layout breaks.
→ `scripts/qa-units.mjs` (`npm run qa:units`) enforces it over the whole
  `cv-site/src` tree in about a second — no browser needed. There is
  deliberately **no exemption list**: a suspended page's stylesheet is checked
  too, so that the day it comes back it does not carry a backlog, and because
  an exemption list is where rules go to die.
→ Two things it does not look at, both on purpose: **comments** ("it was 18px
  tall", "the webp is 177px") are documentation of real measurements and must
  stay in px; and in `.astro`/`.ts` sources only `<style>` blocks, Lit
  ``css` `` templates and `style` attributes are scanned — a "257px" inside a
  sentence is prose, not CSS.
→ Two idioms survive as round numbers rather than converted decimals:
  `border-radius: 999rem` (the pill) and `max-height: 9000rem` (a "very
  large" sentinel). `62.4375rem` is arithmetically the same and says nothing.
→ Note for anyone tempted to reintroduce `1.5px` for a hairline: measured, a
  `1.5px` border computes to `1px` in Chrome anyway, in either unit. It never
  rendered at one and a half pixels.

---

## Verification loop — what a script decides, and what it cannot

→ `cv-site/` has a structural problem no amount of care fixes on its own: every
  page exists twice (IT and EN), and `/design-system` alone is 38 panels — 76
  screens nobody re-checks by hand after a change. Most of what breaks there is
  **decidable**, though: IT/EN parity, index ↔ panel correspondence, every
  component carrying its spec card and snippet, a clean console, no horizontal
  scrollbar at 390px. `scripts/qa-design-system.mjs` (`npm run qa:ds`) asserts
  exactly those, against a real browser, in both languages, exiting 1 with the
  name of the invariant that fell. It found a real one on its first run: the
  panels' DOM order had drifted from the index order, so a no-JS visitor read
  the page in an order the index did not promise.
→ It deliberately stops at the boundary of judgement. It cannot tell that a
  component is documented under the wrong class — the showcase presented
  `lab-label` as a text label for weeks when it is the case's caption block —
  nor that a demo is unfaithful to its real context, nor that a sentence does
  not sound like Giulio. That half needs a critic reading the diff with the bar
  in hand, ideally a fresh-context sub-agent that has not read the rationale it
  is supposed to be checking.
→ Both halves, and the rule that keeps them honest (whoever implements does not
  grade their own work), live in `.claude/skills/verification-loop/SKILL.md` —
  the project's adaptation of the Gauntlet Loop technique. **It is loaded only
  when explicitly asked for by name.**

→ **When each check runs — project rule, decided 2026-08-20.** There are two
  tiers, and the split is deliberate: the cheap tier is text-only and runs
  constantly, the expensive tier opens a browser and runs **only before a push**.

  | While working, after any change | Before pushing (`.husky/pre-push`) |
  | ------------------------------- | ---------------------------------- |
  | `npm run lint`                  | the same lint + format, then:      |
  | `npm run format:check`          | `npm run qa:prepush`, which builds |
  | `npm test`                      | the site, serves the **real build**|
  | `npm run qa:units`              | and runs `qa:ds` + `qa:parity` +   |
  | `cd cv-site && npx astro build` | `qa:links` against it              |

  **`qa:ds` is not to be run during ordinary work** — not even after touching
  the showcase. It costs a browser and a server; the pre-push hook is where it
  belongs, because that is the last moment a defect is still only yours.
  Escape hatch for an urgent push on a work branch: `SKIP_QA=1 git push`.

→ The three browser checks, and what each one is for:
  - `qa:ds` (`qa-design-system.mjs`) — the showcase: index ↔ panel, spec cards,
    snippets, clean console, no horizontal scrollbar at 390px, IT/EN parity of
    the panels.
  - `qa:parity` (`qa-parity.mjs`) — IT ↔ EN on the real pages. Compares
    **counts**, not text: same number of jobs, timeline rows, testimonials,
    education rows and chips in both languages, plus the lens reaching
    `data-mode` and hreflang being present. It found `data-mode` missing on
    every `/en/<lens>` page the first time it ran.
  - `qa:links` (`qa-links.mjs`) — no broken internal link anywhere in the built
    output, and no public page without its counterpart in the other language.
    No browser needed; it reads the HTML. It found five dead `/en/cv` links on
    a site that built clean.

→ `qa:prepush` serves the build on an **ephemeral port bound to 127.0.0.1**, not
  a fixed one. With a fixed port a leftover process from an earlier session can
  hold it — on Windows possibly on `::1` only, so our server still starts on
  IPv4 without error while `localhost` resolves to the stale one. The symptom is
  404 on every page of a site that was just built correctly.

→ After an ordinary change the baseline is the left column above — all text, no
  images. Screenshots are the expensive part and are taken only when a decision
  cannot be read off the numbers, or when asked.
→ When a change to the showcase is not covered by the gauntlet, **add the
  check** rather than testing by hand: a verification script that stops growing
  with the project ages exactly like the "photograph" design system that
  `design-system.css` warns about in its header.

---

## Git hooks

→ `.husky/pre-push` runs `npm run lint && npm run format:check` (the same
  checks as the "Lint & format" CI job) before every `git push`, local or
  from an agent — a push aborts if either fails. Wired automatically by the
  `prepare` script on `npm install` (Husky manages `core.hooksPath`, nothing
  under `.git/hooks/` to maintain by hand).
→ Assumes `cv-site/node_modules` is already installed (root ESLint config
  covers `cv-site/src/**` too, so the Astro parser needs it resolvable) —
  normal on a dev machine, not auto-installed by the hook to keep pushes fast.
→ Since 2026-08-20 the hook also runs `npm run qa:prepush` (build + the three
  browser checks — see § Verification loop). It adds roughly a minute and a
  half to a push, and that is the intended trade: those checks exist to catch
  what lint cannot see, and a check nobody runs is a check that was not
  written. `SKIP_QA=1 git push` skips them for an urgent push on a work
  branch — not on `main`.
→ Typecheck and unit tests stay in CI rather than in the hook: they duplicate
  what the build already surfaces locally, and the hook is already the slow
  step.

---

## Decisions already taken — do not re-propose

Closed calls, with the reasoning. They are written down because each of them
looks like a gap to anyone reading the code for the first time, and each has
already been raised and answered. Re-opening one costs the reader a round trip
for nothing.

→ **Skills have no section of their own, and that is deliberate** (2026-08-20).
  The D3 force graph and the square/glow grid are set aside — not deleted, they
  still live in `/old-version`. On the new CV, a competence appears as a chip
  **inside the job where it was used**, which says more than a list of logos
  detached from any context. Do not propose re-adding a skills section, a graph
  or a grid unless Giulio asks.

→ **Methodology, growth areas, social impact and value flows stay out**
  (2026-08-20). Same reasoning and same status: still in `cv.ts`, still rendered
  by `/old-version`, out of the new pages on purpose.

→ **`/lab/hero` stays where it is.** It is the second entry-page prototype, still
  open, `noindex` and `Disallow`ed. It is *not* dead code: the `/design-system`
  showcase documents its `lab-*` classes and links to it, so removing the page
  breaks a panel. The link to it from the home is wrapped in
  `import.meta.env.DEV` — it never ships.

→ **`/old-version` is intentionally unlinked.** No page on the live site points
  to it, and that is the point: it exists so Giulio can show the previous design
  by typing the URL, not so visitors can wander into it. Do not "fix" it by
  adding a link.

---

## Do NOT

- Write to `stdout` — reserved for MCP JSON-RPC. Use `logger` from `src/utils/logger.ts`.
- Put HTTP logic in `src/index.ts` or MCP logic in `src/http.ts`.
- Commit `.env` — only `.env.example` is tracked.
- Skip Zod validation for tool parameters or env vars.
- Use progress bars for skills in the site — use the square/glow system from `DESIGN.md`.
- Hardcode colors in cv-site — use CSS custom properties (`--color-bg`, `--color-accent`, etc.).

