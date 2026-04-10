import { Hono } from "hono";
import { logger as httpLogger } from "hono/logger";
import { AppError } from "./errors.js";

/**
 * OpenAPI-style schema registry.
 * Add route schemas here so GET /openapi.json stays up to date.
 *
 * HOW TO ADD A ROUTE SCHEMA:
 *   openApiPaths["/my-route"] = { get: { summary: "...", responses: { ... } } };
 */
const openApiPaths: Record<string, unknown> = {
  "/health": {
    get: {
      summary: "Health check",
      responses: {
        "200": {
          description: "Server is running",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "ok" },
                  timestamp: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Creates and configures the Hono HTTP application.
 *
 * HOW TO ADD ROUTES:
 * 1. Create src/http/routes/my-route.ts
 * 2. Export a Hono instance: `export const myRoute = new Hono()`
 * 3. Mount it here: `app.route("/my-path", myRoute)`
 * 4. Add the schema to openApiPaths above.
 */
export function createApp(): Hono {
  const app = new Hono();

  // ── Middleware ────────────────────────────────────────────────────────────
  app.use("*", httpLogger());

  // ── Global error handler ─────────────────────────────────────────────────
  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(err.toJSON(), err.statusCode as Parameters<typeof c.json>[1]);
    }
    return c.json({ error: "InternalError", message: "Unexpected error" }, 500);
  });

  // ── Built-in routes ───────────────────────────────────────────────────────
  app.get("/health", (c) =>
    c.json({ status: "ok", timestamp: new Date().toISOString() }),
  );

  app.get("/openapi.json", (c) =>
    c.json({
      openapi: "3.1.0",
      info: { title: "mcp-base-template API", version: "1.0.0" },
      paths: openApiPaths,
    }),
  );

  // ── Mount feature routes here ─────────────────────────────────────────────
  // import { myRoute } from "./routes/my-route.js";
  // app.route("/my-path", myRoute);

  return app;
}
