import { z } from "zod";

/**
 * Validated environment variables — parsed once at startup.
 * Add new variables here as the project grows.
 * Zod throws at boot if required variables are missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // ── HTTP server (optional — only used by src/http.ts) ──────────────────
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),

  // ── MCP ────────────────────────────────────────────────────────────────
  MCP_DEBUG: z.enum(["0", "1"]).default("0"),
});

export const env = envSchema.parse(process.env);
