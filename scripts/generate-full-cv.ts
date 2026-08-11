/**
 * generate-full-cv.ts
 * Genera un CV PDF ATS-safe con lo storico lavorativo completo: tutte le
 * esperienze di cvData.experience, dal 2008 a oggi, non una selezione
 * curata come Giulio_Occhipinti_UX_Designer_CV_ATS_DRAFT.pdf (generato da
 * generate-ux-cv.ts). Pensato per portali come Indeed, dove il profilo
 * beneficia di continuità senza buchi.
 *
 * Riusa profilo, competenze, certificazioni e formazione già scritti nei
 * Locale di generate-ux-cv.ts (stesso tono, stesse regole di stile) e
 * sostituisce solo esperienza e lavori selezionati con l'elenco completo
 * derivato meccanicamente da cv.ts/cv.en.ts (highlights se presenti,
 * altrimenti la description), così resta sincronizzato con la fonte di
 * verità senza bisogno di riscrivere ogni voce a mano.
 *
 * Output (cartella gitignorata: sono documenti personali, non vanno pushati):
 *   cv-output/Giulio_Occhipinti_CV_Completo_ATS.pdf     (IT)
 *   cv-output/Giulio_Occhipinti_CV_Completo_ATS_EN.pdf  (EN)
 *
 * Uso:
 *   npm run pdf:full
 *   (equivale a: node --import tsx/esm scripts/generate-full-cv.ts)
 *
 * In ambienti dove il Chromium di Playwright non è nella posizione di default,
 * passare il percorso via env PLAYWRIGHT_CHROMIUM_EXECUTABLE.
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { buildHtmlAts, type Locale, type Experience, type Work } from "./cv-pdf-template.js";
import { loadPdfAssets } from "./load-pdf-assets.js";
import { locales as uxLocales } from "./generate-ux-cv.js";
import { cvData, type WorkExperience, type Project } from "../src/data/cv.js";
import { cvDataEn } from "../src/data/cv.en.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "cv-output");
const ASSETS = loadPdfAssets(ROOT);

const SITE = "https://giulio-occhipinti.com";

// Tipo strutturale (non `typeof cvData`, che pinnerebbe i literal string IT
// e romperebbe il passaggio di cvDataEn): entrambe le fonti condividono gli
// stessi tipi WorkExperience/Project, solo il contenuto cambia lingua.
interface SourceData {
  experience: readonly WorkExperience[];
  projects: readonly Project[];
}

function yearOf(iso: string): string {
  return iso.slice(0, 4);
}

function formatYr(startDate: string, endDate: string, presentLabel: string): string {
  const startY = yearOf(startDate);
  if (endDate === "present") return `${startY} — ${presentLabel}`;
  const endY = yearOf(endDate);
  return startY === endY ? startY : `${startY} — ${endY}`;
}

function toExperiences(data: SourceData, presentLabel: string, remoteLabel: string): Experience[] {
  return data.experience.map((e) => ({
    yr: formatYr(e.startDate, e.endDate, presentLabel),
    loc: e.remote && e.location ? `${e.location} / ${remoteLabel}` : (e.location ?? ""),
    role: e.role,
    org: e.company,
    bullets: e.highlights && e.highlights.length > 0 ? e.highlights : [e.description],
  }));
}

function toWorks(data: SourceData): Work[] {
  return data.projects
    .filter((p) => !!p.slug)
    .map((p) => ({
      title: p.name,
      desc: p.description,
      outcome: p.outcomes?.[0] ?? "",
      url: `${SITE}/work/${p.slug}`,
    }));
}

const [ITBase, ENBase] = uxLocales; // ordine [IT, EN] esportato da generate-ux-cv.ts

// I cast a `Locale` bypassano una limitazione nota di TypeScript con
// `exactOptionalPropertyTypes`: lo spread di un oggetto già tipizzato
// `Locale` (nessuna proprietà opzionale mancante) viene comunque inferito
// con campi opzionali "allargati". ITBase/ENBase sono Locale completi, quindi
// il risultato dello spread lo è altrettanto: il cast riflette un fatto vero,
// non nasconde un campo mancante.
const IT = {
  ...ITBase,
  file: "Giulio_Occhipinti_CV_Completo_ATS.pdf",
  expEyebrow: "percorso completo · dal 2008 a oggi",
  earlier: "Percorso completo, senza selezioni: ogni ruolo dal 2008 a oggi è elencato sopra.",
  experiences: toExperiences(cvData, "oggi", "Remoto"),
  works: toWorks(cvData),
} as Locale;

const EN = {
  ...ENBase,
  file: "Giulio_Occhipinti_CV_Completo_ATS_EN.pdf",
  expEyebrow: "full history · 2008 to present",
  earlier: "Full history, no curation: every role from 2008 to today is listed above.",
  experiences: toExperiences(cvDataEn, "present", "Remote"),
  works: toWorks(cvDataEn),
} as Locale;

const locales: Locale[] = [IT, EN];

async function main(): Promise<void> {
  mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage();

  for (const L of locales) {
    await page.setContent(buildHtmlAts(L, ASSETS), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const outPath = resolve(OUT_DIR, L.file);
    await page.pdf({ path: outPath, format: "A4", printBackground: true });
    console.log(`PDF generato (storico completo): ${outPath}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
