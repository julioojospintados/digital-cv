/**
 * generate-targeted-cv.ts
 * Renderizza in PDF (A4, designed + draft ATS-puro) una variante di CV
 * "targettizzata" — prodotta dal subagent .claude/agents/cv-recruiter.md a
 * partire da un JSON conforme all'interfaccia `Locale` di generate-ux-cv.ts.
 *
 * Non contiene contenuti hardcoded: legge un solo file JSON in input e lo
 * passa agli stessi template (buildHtml / buildHtmlAts) usati da pdf:ux, così
 * ogni variante per country/company/parser/ruolo esce con lo stesso Design
 * System e la stessa sicurezza ATS già validati lì.
 *
 * Output (cartella gitignorata: sono documenti personali, non vanno pushati):
 *   cv-output/targeted/<file>                  (designed)
 *   cv-output/targeted/<file>_ATS_DRAFT.pdf     (draft ATS-puro)
 *
 * Uso:
 *   npm run pdf:targeted -- path/to/variant.json
 *   (equivale a: node --import tsx/esm scripts/generate-targeted-cv.ts path/to/variant.json)
 */

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { buildHtml, buildHtmlAts, type Locale } from "./generate-ux-cv.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "cv-output/targeted");

// ── Schema — mirror esatto dell'interfaccia Locale in generate-ux-cv.ts ─────
// Convalida il JSON prodotto dall'agent PRIMA di sprecare un avvio di
// Chromium: un campo mancante/sbagliato fallisce qui con un errore leggibile
// invece di produrre un PDF con "undefined" stampato dentro.

const experienceSchema = z.object({
  yr: z.string(),
  loc: z.string(),
  role: z.string(),
  org: z.string(),
  bullets: z.array(z.string()).min(1),
});

const workSchema = z.object({
  title: z.string(),
  desc: z.string(),
  outcome: z.string(),
  url: z.string(),
});

const skillGroupSchema = z.object({
  label: z.string(),
  chips: z.array(z.string()).min(1),
  key: z.boolean().optional(),
});

const certSchema = z.object({
  by: z.string(),
  name: z.string(),
  strong: z.boolean().optional(),
});

const eduSchema = z.object({
  yr: z.string(),
  title: z.string(),
  sub: z.string(),
});

const langSchema = z.object({
  name: z.string(),
  level: z.string(),
});

const localeSchema = z.object({
  lang: z.enum(["it", "en"]),
  file: z.string(),
  positioning: z.string(),
  creds: z.string(),
  location: z.string(),
  linkedinUrl: z.string(),
  siteLabel: z.string(),
  workLinkLabel: z.string(),
  qrCap: z.string(),
  visitBtn: z.string(),
  profileLead: z.string(),
  profile: z.string(),
  secExperience: z.string(),
  expEyebrow: z.string(),
  earlier: z.string(),
  secWork: z.string(),
  workEyebrow: z.string(),
  secSkills: z.string(),
  skillsEyebrow: z.string(),
  secCerts: z.string(),
  secEdu: z.string(),
  secLangs: z.string(),
  experiences: z.array(experienceSchema).min(1),
  works: z.array(workSchema),
  skills: z.array(skillGroupSchema).min(1),
  certs: z.array(certSchema),
  edu: z.array(eduSchema),
  langs: z.array(langSchema),
  ctaTitle: z.string(),
  ctaSub: z.string(),
  portfolioBtn: z.string(),
  gdprFooter: z.string().optional(),
  // Metadati di audit facoltativi (TARGET_COUNTRY, COMPANY_TYPE, PARSER_TYPE,
  // ROLE_TYPE) — ignorati dal renderer, tenuti solo per tracciabilità nel
  // file JSON stesso.
  _meta: z.record(z.string(), z.string()).optional(),
});

// ── CLI ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Uso: npm run pdf:targeted -- path/to/variant.json");
    process.exit(1);
  }

  const raw: unknown = JSON.parse(readFileSync(resolve(process.cwd(), jsonPath), "utf-8"));
  const parsed = localeSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(`JSON non valido rispetto allo schema Locale: ${jsonPath}`);
    console.error(z.prettifyError(parsed.error));
    process.exit(1);
  }
  const { _meta, ...localeFields } = parsed.data;
  void _meta; // tenuto solo per tracciabilità nel file JSON, non usato dal renderer
  const locale = localeFields as Locale;

  mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();

  await page.setContent(buildHtml(locale), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const outPath = resolve(OUT_DIR, locale.file);
  await page.pdf({ path: outPath, format: "A4", printBackground: true, preferCSSPageSize: true });
  console.log(`PDF generato: ${outPath}`);

  await page.setContent(buildHtmlAts(locale), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const atsPath = resolve(OUT_DIR, locale.file.replace(".pdf", "_ATS_DRAFT.pdf"));
  await page.pdf({ path: atsPath, format: "A4", printBackground: true });
  console.log(`PDF generato (draft ATS-puro): ${atsPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
