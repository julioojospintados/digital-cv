import { z } from "zod";

/**
 * Validated environment variables — parsed once at startup.
 * Add new variables here as the project grows.
 * Zod throws at boot if required variables are missing or invalid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // ── HTTP server (optional — only used by src/http.ts) ──────────────────
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  HOST: z.string().default("0.0.0.0"),

  // ── MCP ────────────────────────────────────────────────────────────────
  MCP_DEBUG: z.enum(["0", "1"]).default("0"),

  // ── cv-recruiter tool (src/tools/cv-recruiter.ts) — chiama il tool web
  // deployato su cv-site (/api/cv-recruiter). Entrambe opzionali: il tool
  // resta registrato ma risponde con un errore chiaro se mancano, invece di
  // far fallire il boot dell'intero server MCP.
  CV_TOOL_BASE_URL: z.string().default("https://giulio-occhipinti.com"),
  CV_TOOL_PASSPHRASE: z.string().optional(),
});

export const env = envSchema.parse(process.env);
