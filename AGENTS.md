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

**4 global modes** — each mode is an Astro route (`[mode].astro`), not a URL param:

| Route         | Persona                  | Accent                        |
| ------------- | ------------------------ | ------------------------------ |
| `/tech`       | Software Developer       | Cyan `rgba(0,255,200,1)`      |
| `/creative`   | Web & UX Designer        | Orange `rgba(255,107,53,1)`   |
| `/human`      | AI & Digital Specialist  | Gold `rgba(240,200,127,1)`    |
| `/management` | Project Manager          | Purple `rgba(180,100,255,1)`  |

All 4 modes share the ottanio background `rgba(8,73,67,1)` — only `--color-accent` changes.
The mode changes visual emphasis only, never the template or structure.

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

→ **Copy.** Any Italian text added or changed directly in an Astro page or
  component (e.g. narrative sections on `cv-site/src/pages/index.astro`) must
  be mirrored the same session in its EN counterpart
  (`cv-site/src/pages/en/index.astro`, `en/cv.astro`, `en/work/...`) —
  translated, not just left out. If the text is personal/voice-heavy (bio,
  storytelling, wordplay), translate carefully to preserve tone and flag the
  translation to the user for review rather than treating it as final.

→ **Structure and behaviour.** The same applies to everything that is not
  text: DOM order of modes/cards/nav, which item is active or open by
  default, sort order, dropdown contents, interactive affordances. If a
  change makes IT and EN behave differently, it is a bug — fix both sides in
  the same session.

→ **Don't hardcode on the EN side what is data-driven on the IT side.**
  The IT CV page gets its mode from the route (`[mode].astro`); `/en/cv` is a
  single static page with no mode in its path, so it renders `DEFAULT_MODE`
  and switches client-side. That is the *only* legitimate asymmetry, and it
  must be expressed by reusing the IT logic with `DEFAULT_MODE` substituted
  for `mode` — never by a hardcoded `=== "tech"` condition. Past bugs from
  this: hero copy frozen on one persona, accordion opened on the wrong
  cluster, projects and skills scored against the wrong mode.

→ **Changing the default mode touches several files at once.** Keep these in
  sync: `DEFAULT_MODE` in `cv-site/src/scripts/cv-init.ts`, the fallbacks in
  `cv-site/src/islands/stores/modeStore.ts` (`getInitialMode` and `initMode`),
  the `/cv` redirect in `cv-site/src/pages/cv.astro`, and `DEFAULT_MODE` plus
  the `mode` prop passed to `Layout` in `cv-site/src/pages/en/cv.astro`.

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
    pages/
      index.astro         ← Entry point with GO preloader
      home.astro          ← Landing with the 4 mode-cards (knolling)
      [mode].astro        ← CV page for /tech /creative /human /management
      cv.astro            ← Legacy — redirects to /tech
      work/index.astro    ← Case study index
      work/[slug].astro   ← Project case studies
      en/index.astro      ← English entry point
      en/cv.astro         ← English CV (static page — mode is client-side only, no mode in path)
      en/work/            ← English case studies (index.astro + [slug].astro)
    components/           ← Static Astro components
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
      stores/modeStore.ts ← NanoStore for global mode state (tech/creative/human/management)
    lib/
      exp-clusters.ts     ← Shared experience-cluster definitions (IT/EN labels, exp+proj refs)
    scripts/              ← Shared client-side logic (vanilla TS + GSAP)
      cv-init.ts          ← CV page init: mode switch, scroll, accordions, feedback carousel
      index-init.ts       ← Home init: preloader, knolling, mode cards, launch journey
      mode-helpers.ts     ← Pure mode-system functions (tested in mode-helpers.test.ts)
      work-journey.ts     ← /work page animations
      memory-drawer.ts    ← "About me" photo/story drawer (3D page-flip)
      intro-seen.ts       ← sessionStorage flag to skip the GO intro on return visits
    styles/
      global.css          ← CSS custom properties for 4 modes, reset, cursor, focus
      cv-page.css         ← CV page styles ([mode].astro / en/cv.astro)
      index-page.css      ← Home/entry styles
      work-page.css       ← /work page styles
    layouts/Layout.astro  ← Base layout (head/SEO/JSON-LD, fonts, Lenis, custom cursor, FAB)

scripts/                  ← Root utility scripts (Node)
  parse-cv.ts             ← Parse source CV data
  generate-cv-pdf.ts      ← Render the knolling CV to A4 PDFs with QR (npm run pdf:cv)
  gen-og-image.mjs        ← Generate the Open Graph image
  qa-mobile.js            ← Responsive QA via Playwright
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
  skills/                 ← Claude Code skills — mirrors .github/skills, loaded on demand
    knolling-cv/SKILL.md         ← Global project context — load FIRST for any request
    design-system/SKILL.md       ← UI, animations (Emil Kowalski rules), knolling, GSAP, CSS custom properties
    design-system/knolling-reference.png  ← Visual reference for knolling layout
    identity/SKILL.md            ← Bio, tone of voice, GO narrative, job hunting
    agile-methodology/SKILL.md   ← Agile, Lean, PM for SMBs, impactScore, sprints
    mcp-architecture/SKILL.md    ← MCP tools, Hono, cv.ts, tests, AI workflow
    partnership-strategy/SKILL.md ← Fractional partner, SMB consulting positioning
    caveman/SKILL.md             ← Utility skill — ultra-compressed response mode (/caveman)

.mcp.json                 ← Project-scoped MCP servers for Claude Code (mcp-base-template, sequential-thinking)
CLAUDE.md                 ← Claude Code entry point (imports this file, adds skill-loading + MCP notes)
AGENTS.md                 ← This file — tool-agnostic project guide
```

---

## Do NOT

- Write to `stdout` — reserved for MCP JSON-RPC. Use `logger` from `src/utils/logger.ts`.
- Put HTTP logic in `src/index.ts` or MCP logic in `src/http.ts`.
- Commit `.env` — only `.env.example` is tracked.
- Skip Zod validation for tool parameters or env vars.
- Use progress bars for skills in the site — use the square/glow system from `DESIGN.md`.
- Hardcode colors in cv-site — use CSS custom properties (`--color-bg`, `--color-accent`, etc.).

