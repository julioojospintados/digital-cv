/**
 * Ledger strutturato delle candidature (tracking candidato/mail
 * ricevuta/conferma CV/esito), Vercel Blob PRIVATO — stesso motivo di
 * insights-store.ts: dati personali di candidatura, mai nel repo né sul
 * filesystem effimero della function.
 *
 * A differenza di insights-store.ts (testo Markdown append-only, un file per
 * bucket, usato per calibrare le generazioni), qui serve un JSON
 * *aggiornabile* — lo stato di una candidatura cambia nel tempo — e un solo
 * file per tutte le candidature: la vista che serve è "tutte le mie
 * candidature aperte", non calibrazione per-paese. Blob è l'unica fonte di
 * verità condivisa fra il tool mobile e il tool MCP desktop (che chiama le
 * stesse route HTTP, non scrive file locali) — a differenza di jd-insights,
 * qui i due lati devono vedere esattamente lo stesso stato.
 */
import { put, get } from "@vercel/blob";
import type { CountryBucket } from "./fixed-copy.js";

const LEDGER_PATHNAME = "applications/ledger.json";

export type ApplicationOutcome = "pending" | "rejected" | "offer" | "ghosted";

export interface ApplicationStatus {
  applied: boolean;
  appliedAt: string | null;
  emailReceived: boolean;
  emailReceivedAt: string | null;
  cvConfirmationReceived: boolean;
  cvConfirmationReceivedAt: string | null;
  outcome: ApplicationOutcome;
  outcomeAt: string | null;
}

export interface ApplicationRecord {
  id: string;
  createdAt: string;
  bucket: CountryBucket;
  company: string;
  role: string;
  matchPercentage: number;
  salaryEstimate: string;
  status: ApplicationStatus;
  notes: string | null;
}

export type NewApplicationInput = Pick<
  ApplicationRecord,
  "bucket" | "company" | "role" | "matchPercentage" | "salaryEstimate"
>;

/** Solo questi campi sono scrivibili da un update — mai id/createdAt/company/... */
export type ApplicationStatusPatch = Partial<
  Pick<ApplicationStatus, "applied" | "emailReceived" | "cvConfirmationReceived" | "outcome">
>;

const DEFAULT_STATUS: ApplicationStatus = {
  applied: false,
  appliedAt: null,
  emailReceived: false,
  emailReceivedAt: null,
  cvConfirmationReceived: false,
  cvConfirmationReceivedAt: null,
  outcome: "pending",
  outcomeAt: null,
};

async function readLedger(): Promise<ApplicationRecord[]> {
  try {
    const result = await get(LEDGER_PATHNAME, { access: "private" });
    if (!result?.stream) return [];
    const text = await new Response(result.stream).text();
    if (!text.trim()) return [];
    return JSON.parse(text) as ApplicationRecord[];
  } catch (err) {
    console.error("[cv-recruiter] impossibile leggere il ledger candidature:", err);
    return [];
  }
}

async function writeLedger(records: ApplicationRecord[]): Promise<boolean> {
  try {
    await put(LEDGER_PATHNAME, JSON.stringify(records, null, 2), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json; charset=utf-8",
    });
    return true;
  } catch (err) {
    console.error("[cv-recruiter] impossibile scrivere il ledger candidature:", err);
    return false;
  }
}

/** Non lancia mai — ritorna null su qualunque fallimento, il chiamante decide il fallback. */
export async function createApplication(
  input: NewApplicationInput,
): Promise<ApplicationRecord | null> {
  const records = await readLedger();
  const record: ApplicationRecord = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
    status: { ...DEFAULT_STATUS },
    notes: null,
  };
  records.push(record);
  const saved = await writeLedger(records);
  return saved ? record : null;
}

export async function listApplications(): Promise<ApplicationRecord[]> {
  const records = await readLedger();
  return [...records].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Ritorna null se l'id non esiste o il salvataggio fallisce. */
export async function updateApplication(
  id: string,
  patch: ApplicationStatusPatch,
): Promise<ApplicationRecord | null> {
  const records = await readLedger();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = records[index];
  const nextStatus: ApplicationStatus = { ...current.status };

  if (patch.applied !== undefined) {
    nextStatus.applied = patch.applied;
    if (patch.applied && !nextStatus.appliedAt) nextStatus.appliedAt = now;
  }
  if (patch.emailReceived !== undefined) {
    nextStatus.emailReceived = patch.emailReceived;
    if (patch.emailReceived && !nextStatus.emailReceivedAt) nextStatus.emailReceivedAt = now;
  }
  if (patch.cvConfirmationReceived !== undefined) {
    nextStatus.cvConfirmationReceived = patch.cvConfirmationReceived;
    if (patch.cvConfirmationReceived && !nextStatus.cvConfirmationReceivedAt) {
      nextStatus.cvConfirmationReceivedAt = now;
    }
  }
  if (patch.outcome !== undefined) {
    nextStatus.outcome = patch.outcome;
    nextStatus.outcomeAt = patch.outcome === "pending" ? null : now;
  }

  const updated: ApplicationRecord = { ...current, status: nextStatus };
  records[index] = updated;
  const saved = await writeLedger(records);
  return saved ? updated : null;
}
