import type { APIRoute } from "astro";
import { appendInsight } from "../../server/cv-recruiter/insights-store.js";
import type { CountryBucket } from "../../server/cv-recruiter/fixed-copy.js";
import { readEnv, jsonResponse } from "../../server/cv-recruiter/http-helpers.js";

// Funzione serverless Vercel — persiste la "voce memoria" prodotta da
// api/cv-recruiter.ts su Vercel Blob (store privato, vedi insights-store.ts
// per il perché non nel repo né su disco). Route separata dalla generazione
// principale apposta: un fallimento qui non deve mai intaccare il CV/report
// già generato, e l'utente decide esplicitamente quando salvare (bottone
// dedicato in cv-recruiter.astro), non un side-effect automatico di ogni
// generazione.
export const prerender = false;

interface RequestBody {
  passphrase?: string;
  bucket?: CountryBucket;
  insightEntry?: string;
}

const VALID_BUCKETS: CountryBucket[] = ["usa-canada", "europa", "italia"];

export const POST: APIRoute = async ({ request }) => {
  const configuredPassphrase = readEnv("CV_TOOL_PASSPHRASE");
  if (!configuredPassphrase) {
    return jsonResponse({ ok: false, error: "Tool non configurato lato server." }, 503);
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return jsonResponse({ ok: false, error: "JSON non valido." }, 400);
  }

  if (body.passphrase !== configuredPassphrase) {
    return jsonResponse({ ok: false, error: "Passphrase errata." }, 401);
  }

  if (!body.bucket || !VALID_BUCKETS.includes(body.bucket) || !body.insightEntry?.trim()) {
    return jsonResponse({ ok: false, error: "bucket o insightEntry mancanti/non validi." }, 400);
  }

  const saved = await appendInsight(body.bucket, body.insightEntry.trim());
  if (!saved) {
    return jsonResponse(
      { ok: false, error: "Salvataggio non riuscito. Riprova o scarica manualmente." },
      502,
    );
  }

  return jsonResponse({ ok: true });
};
