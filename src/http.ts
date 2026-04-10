import { serve } from "@hono/node-server";
import { createApp } from "./http/app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

/**
 * HTTP entry point — alternative to index.ts (stdio MCP).
 *
 * Start with:  npm run http:start
 * Dev mode:    npm run http:dev
 *
 * Use this when the project needs to serve HTTP (REST API, HTML pages, etc.).
 * The MCP stdio server (index.ts) and this HTTP server are independent —
 * run whichever fits the current use case, or both simultaneously.
 */
const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
    hostname: env.HOST,
  },
  (info) => {
    logger.info(`HTTP server running → http://${info.address}:${info.port}`);
    logger.info(`Health check       → http://${info.address}:${info.port}/health`);
  },
);
