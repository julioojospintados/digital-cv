import type { APIRoute } from "astro";
import {
  listApplications,
  updateApplication,
  type ApplicationStatusPatch,
} from "../../server/cv-recruiter/applications-store.js";
import { readEnv, jsonResponse } from "../../server/cv-recruiter/http-helpers.js";

// Funzione serverless Vercel — legge/aggiorna il ledger candidature creato da
// api/cv-recruiter.ts. Un solo handler POST con `action` nel body invece di
// GET/PATCH: la passphrase non deve mai finire in query string/log, stessa
// scelta già fatta per le altre 2 route di questo tool.
export const prerender = false;

const VALID_OUTCOMES = ["pending", "rejected", "offer", "ghosted"] as const;
const PATCHABLE_KEYS = ["applied", "emailReceived", "cvConfirmationReceived", "outcome"] as const;

interface RequestBody {
  passphrase?: string;
  action?: "list" | "update";
  id?: string;
  patch?: Record<string, unknown>;
}

function sanitizePatch(raw: Record<string, unknown> | undefined): ApplicationStatusPatch | null {
  if (!raw || typeof raw !== "object") return null;
  const patch: ApplicationStatusPatch = {};
  for (const key of Object.keys(raw)) {
    if (!(PATCHABLE_KEYS as readonly string[]).includes(key)) return null;
  }
  if ("applied" in raw) {
    if (typeof raw.applied !== "boolean") return null;
    patch.applied = raw.applied;
  }
  if ("emailReceived" in raw) {
    if (typeof raw.emailReceived !== "boolean") return null;
    patch.emailReceived = raw.emailReceived;
  }
  if ("cvConfirmationReceived" in raw) {
    if (typeof raw.cvConfirmationReceived !== "boolean") return null;
    patch.cvConfirmationReceived = raw.cvConfirmationReceived;
  }
  if ("outcome" in raw) {
    if (!VALID_OUTCOMES.includes(raw.outcome as (typeof VALID_OUTCOMES)[number])) return null;
    patch.outcome = raw.outcome as (typeof VALID_OUTCOMES)[number];
  }
  return patch;
}

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

  if (body.action === "list") {
    const applications = await listApplications();
    return jsonResponse({ ok: true, applications });
  }

  if (body.action === "update") {
    if (!body.id?.trim()) {
      return jsonResponse({ ok: false, error: "id mancante." }, 400);
    }
    const patch = sanitizePatch(body.patch);
    if (!patch || Object.keys(patch).length === 0) {
      return jsonResponse({ ok: false, error: "patch mancante o non valida." }, 400);
    }
    const updated = await updateApplication(body.id.trim(), patch);
    if (!updated) {
      return jsonResponse(
        { ok: false, error: "Candidatura non trovata o salvataggio fallito." },
        404,
      );
    }
    return jsonResponse({ ok: true, application: updated });
  }

  return jsonResponse({ ok: false, error: "action deve essere 'list' o 'update'." }, 400);
};
