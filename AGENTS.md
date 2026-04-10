# AGENTS.md — AI Agent Guide

This file tells AI agents (GitHub Copilot, Claude, GPT, etc.) what each part
of this codebase is for, what conventions apply, and where to make changes.

---

## Project overview

A reusable **Node.js + TypeScript** base template with two independent entry points:

| Entry point | Purpose |
|---|---|
| `src/index.ts` | MCP server (stdio) — for AI tool/resource/prompt capabilities |
| `src/http.ts` | HTTP server (Hono) — for REST APIs, HTML pages, web products |

Both can run simultaneously or independently depending on the use case.

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
  mcp.json            ← External MCP servers active in VS Code (GitHub, Brave, etc.)
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
