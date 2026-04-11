# AGENTS.md — AI Agent Guide

This file tells AI agents (GitHub Copilot, Claude, GPT, etc.) what each part
of this codebase is for, what conventions apply, and where to make changes.

---

## Project overview

**Digital CV of Giulio Occhipinti** — an interactive CV with two independent systems:

| Entry point | Purpose |
|---|---|
| `cv-site/` | Astro static site — the visual, interactive CV |
| `src/index.ts` | MCP server (stdio) — AI tooling for CV data access |
| `src/http.ts` | HTTP server (Hono) — REST API |

---

## CV Data — source of truth

| File | Content |
|---|---|
| `src/data/cv.ts` | Full CV data in **Italian** — single source of truth |
| `src/data/cv.en.ts` | **English** translation — imports types from `cv.ts` |

Both export all CV sections: `personal`, `social`, `languages`, `experience`, `education`,
`certifications`, `technicalSkills`, `softSkills`, `transversalSkills`, `methodology`,
`growthAreas`, `projects`, `interests`, `socialImpact`.

**Never change the type structure in `cv.ts` without updating `cv.en.ts` too.**

---

## Design system (cv-site/)

The site is a **Knolling / Flat Lay CV**: each element is an "object" laid out on a flat surface
like items in a knolling photograph.

**3 global modes** (set via URL `?mode=...` and `localStorage`):

| Mode | Focus | Theme |
|---|---|---|
| `tech` | Architectures, code, systems | Dark, neon green/blue |
| `creative` | Story, image, sound | Warm, editorial |
| `human` | Impact, relationships, presence | Neutral paper |

Full spec → `cv-site/DESIGN.md`
Operative rules for Copilot → `.vscode/design.instructions.md` (auto-injected on `cv-site/src/**`)

---

## Where to make changes

### Editing CV content
→ Edit `src/data/cv.ts` (Italian). Mirror changes in `src/data/cv.en.ts` (English).

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
  tools/index.ts          ← MCP tool registry
  tools/echo.ts           ← Example tool — copy as template
  resources/index.ts      ← MCP resource registry
  prompts/index.ts        ← MCP prompt template registry
  utils/logger.ts         ← stderr-only logger

cv-site/                  ← Astro site (the actual CV)
  DESIGN.md               ← Full visual system specification
  src/
    pages/                ← Astro pages (index.astro, cv.astro, en/)
    components/           ← Static Astro components
    islands/              ← Lit interactive web components
      stores/modeStore.ts ← NanoStore for global mode state
    styles/global.css     ← CSS custom properties for 3 modes
    layouts/Layout.astro  ← Base layout

.vscode/
  mcp.json                ← External MCP servers config (VS Code)
  design.instructions.md  ← Auto-injected on cv-site/src/** — design rules
  typescript.instructions.md ← Auto-injected on src/**/*.ts
  http.instructions.md    ← Auto-injected on src/http/**
  prompts/                ← Reusable /slash prompts

.github/
  copilot-instructions.md ← Always injected in every Copilot chat

AGENTS.md                 ← This file
```

---

## Do NOT

- Write to `stdout` — reserved for MCP JSON-RPC. Use `logger` from `src/utils/logger.ts`.
- Put HTTP logic in `src/index.ts` or MCP logic in `src/http.ts`.
- Commit `.env` — only `.env.example` is tracked.
- Skip Zod validation for tool parameters or env vars.
- Use progress bars for skills in the site — use the square/glow system from `DESIGN.md`.
- Hardcode colors in cv-site — use CSS custom properties (`--color-bg`, `--color-accent`, etc.).

---

## Where to make changes

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

## File reference

```
src/
  index.ts            ← MCP entry point (stdio transport) — do not add HTTP here
  http.ts             ← HTTP entry point (Hono/Node) — do not add MCP here
  server.ts           ← McpServer factory — only MCP wiring goes here
  config/
    env.ts            ← Zod-validated env vars — single source of truth for config
  http/
    app.ts            ← Hono app factory + global error handler + /openapi.json
    errors.ts         ← Typed HTTP error classes (AppError and subclasses)
    routes/           ← One file per feature route (create as needed)
  tools/
    index.ts          ← MCP tool registry
    echo.ts           ← Example tool — copy as template
  resources/
    index.ts          ← MCP resource registry
  prompts/
    index.ts          ← MCP prompt template registry
  utils/
    logger.ts         ← stderr-only logger (stdout reserved for MCP JSON-RPC)
.vscode/
  mcp.json            ← External MCP servers active in VS Code (GitHub, Sequential Thinking, etc.)
  prompts/            ← Reusable /slash prompts for Copilot
  typescript.instructions.md  ← TypeScript conventions auto-injected into Copilot
  http.instructions.md        ← Hono/HTTP conventions auto-injected into Copilot
.github/
  copilot-instructions.md     ← Global Copilot behavior rules
```

---

## Do NOT

- Write to `stdout` — it is reserved for MCP JSON-RPC protocol. Use `logger` from `src/utils/logger.ts`.
- Put HTTP logic in `src/index.ts` or MCP logic in `src/http.ts`.
- Commit `.env` — only `.env.example` is tracked.
- Skip Zod validation for tool parameters or env vars.
