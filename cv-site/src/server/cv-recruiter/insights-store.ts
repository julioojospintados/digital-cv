/**
 * Persistenza delle "voci memoria" JD (auto-apprendimento) in Vercel Blob,
 * store PRIVATO — non nel repo (cv-output/jd-insights/ è gitignorato e il
 * repo digital-cv è pubblico, quindi mai lì) né sul filesystem della
 * function (effimero, non sopravvive tra invocazioni). Stesso formato
 * append-only di quanto il subagent Claude Code scrive in locale in
 * cv-output/jd-insights/<bucket>.md (vedi .claude/agents/cv-recruiter.md) —
 * un blob per bucket, pathname deterministico (addRandomSuffix: false +
 * allowOverwrite: true) così ogni nuova voce si legge, si accoda e si
 * riscrive sullo stesso file invece di crearne uno nuovo ogni volta.
 *
 * access: "private" (non "public"): il contenuto sono dati personali di
 * candidatura (aziende, stipendi stimati, gap sul profilo di Giulio) — la
 * lettura richiede BLOB_READ_WRITE_TOKEN, mai esposto al browser.
 */
import { put, get } from "@vercel/blob";
import type { CountryBucket } from "./fixed-copy.js";

const pathnameFor = (bucket: CountryBucket) => `jd-insights/${bucket}.md`;

async function readExisting(pathname: string): Promise<string> {
  const result = await get(pathname, { access: "private" });
  if (!result?.stream) return "";
  return new Response(result.stream).text();
}

/** Non lancia mai — ritorna false su qualunque fallimento, il chiamante decide il fallback. */
export async function appendInsight(bucket: CountryBucket, entry: string): Promise<boolean> {
  try {
    const pathname = pathnameFor(bucket);
    const existing = await readExisting(pathname);
    const updated = existing ? `${existing}\n${entry}` : entry;
    await put(pathname, updated, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "text/markdown; charset=utf-8",
    });
    return true;
  } catch (err) {
    console.error("[cv-recruiter] impossibile salvare la voce memoria su Blob:", err);
    return false;
  }
}
