/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Server-only — Google AI Studio API key, mai esposta al client (nome senza prefisso PUBLIC_). */
  readonly GEMINI_API_KEY: string;
  /** Facoltativa — override del modello Gemini, default "gemini-3-flash" se assente. */
  readonly GEMINI_MODEL: string;
  /** Server-only — passphrase che protegge /tools/cv-recruiter e la sua API. */
  readonly CV_TOOL_PASSPHRASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
