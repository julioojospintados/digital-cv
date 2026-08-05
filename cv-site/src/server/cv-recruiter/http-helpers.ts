/**
 * Condiviso tra le route api/cv-recruiter.ts e api/cv-recruiter-insight.ts.
 *
 * process.env PRIMA di import.meta.env, non il contrario: Vite/Astro
 * sostituiscono `import.meta.env.X` staticamente al momento della build, col
 * valore presente allora. Su Vercel le variabili impostate nel pannello dopo
 * (o non esposte alla build) restano quindi `undefined` a runtime — vedi
 * AGENTS.md per l'incidente reale causato da questo. import.meta.env resta
 * come fallback per `astro dev`, che carica il .env locale.
 */
export function readEnv(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return fromProcess || (import.meta.env as Record<string, string | undefined>)[name];
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
