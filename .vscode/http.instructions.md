---
applyTo: "src/http/**/*.ts"
---

# Coding conventions — HTTP layer (Hono)

## Framework

- Use **Hono** (`import { Hono } from "hono"`) for all HTTP handling
- Each feature gets its own file in `src/http/routes/<name>.ts`
- Export a `Hono` instance from each route file; mount it in `src/http/app.ts`

## Error handling

- **Never** throw raw `Error` from route handlers — use typed errors from `src/http/errors.ts`
- Available error classes: `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `InternalError`
- The global error handler in `app.ts` converts them to JSON automatically

## Input validation

- Validate all request body/query/param inputs with **Zod** before using them
- Return `ValidationError` (422) when validation fails — include Zod issues as `details`

## OpenAPI

- Every new route must have a corresponding entry in `openApiPaths` in `src/http/app.ts`
- `GET /openapi.json` must always reflect the current API surface

## Response conventions

- Always use `c.json()` for JSON responses
- Use `c.html()` for HTML responses (server-rendered pages)
- HTTP status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401, 403, 404, 422, 500

## Testing

- Every route file gets a sibling test file: `src/http/routes/<name>.test.ts`
- Use `app.request("/path")` from Hono's test helpers — no real HTTP server needed
- See `src/http/app.test.ts` as the canonical example

## Logging

- Use `logger` from `src/utils/logger.ts` — never `console.log()` (stdout is reserved for MCP)
