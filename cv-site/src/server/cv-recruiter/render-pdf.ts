/**
 * render-pdf.ts
 * Rendering PDF lato server (designed + ATS draft) per il tool mobile, via
 * playwright-core + @sparticuz/chromium (Chromium impacchettato per
 * ambienti serverless — Vercel incluso).
 *
 * ⚠️ Parte a rischio più alto di tutto il tool: non verificabile al 100% fuori
 * da un deploy Vercel reale (limiti di memoria/durata della function, se il
 * bundler della funzione (esbuild via @astrojs/vercel) riesce a tracciare
 * correttamente il binario di @sparticuz/chromium anche marcato "external"
 * in vite.build.rollupOptions.external — vedi astro.config.mjs). Per questo
 * il chiamante (api/cv-recruiter.ts) NON deve mai propagare un errore da
 * qui come 500: cattura, logga, e ripiega sul solo JSON scaricabile — vedi
 * renderPdfs() sotto, che ritorna null invece di lanciare.
 *
 * In locale (astro dev, non su Vercel) usa il Chromium installato da
 * Playwright stesso invece del binario sparticuz — più veloce, nessun
 * download extra — rilevato via l'assenza di process.env.VERCEL.
 */

import { chromium as playwright } from "playwright-core";
import sparticuzChromium from "@sparticuz/chromium";
import {
  buildHtml,
  buildHtmlAts,
  buildCoverLetterHtml,
  type Locale,
  type CoverLetterContent,
  type CoverLetterMeta,
} from "@cv-pdf-template";
import { PDF_ASSETS } from "./pdf-assets-loader.js";

export interface RenderedPdfs {
  designed: Buffer;
  atsDraft: Buffer;
  coverLetter: Buffer | null;
}

async function launchBrowser() {
  const isVercel = Boolean(process.env.VERCEL);
  if (!isVercel) {
    // Locale: nessun binario è incluso in playwright-core, e la revisione che
    // cerca può non coincidere con quella installata dal pacchetto
    // `playwright` completo della root (versioni diverse → cartelle diverse).
    // PLAYWRIGHT_CHROMIUM_EXECUTABLE permette di puntare a quella già
    // presente, stessa convenzione di scripts/generate-ux-cv.ts. Senza la
    // variabile si prova comunque il percorso di default: se fallisce,
    // renderPdfs() ripiega sul solo JSON invece di rompere la richiesta.
    const local = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
    return playwright.launch(
      local ? { headless: true, executablePath: local } : { headless: true },
    );
  }
  return playwright.launch({
    args: sparticuzChromium.args,
    executablePath: await sparticuzChromium.executablePath(),
    headless: true,
  });
}

/**
 * Non lancia mai — ritorna null su qualunque fallimento, il chiamante ripiega
 * sul JSON. coverLetter è nullable perché il modello può non averla prodotta
 * (schema nullable, safety valve) senza che questo debba far fallire anche
 * il rendering di CV designed/ATS, che restano il caso primario.
 */
export async function renderPdfs(
  locale: Locale,
  coverLetter: CoverLetterContent | null,
  coverLetterMeta: CoverLetterMeta,
): Promise<RenderedPdfs | null> {
  let browser: Awaited<ReturnType<typeof launchBrowser>> | undefined;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    await page.setContent(buildHtml(locale, PDF_ASSETS), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const designed = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    await page.setContent(buildHtmlAts(locale, PDF_ASSETS), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const atsDraft = await page.pdf({ format: "A4", printBackground: true });

    let coverLetterPdf: Buffer | null = null;
    if (coverLetter) {
      await page.setContent(buildCoverLetterHtml(coverLetter, coverLetterMeta, PDF_ASSETS), {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      coverLetterPdf = await page.pdf({ format: "A4", printBackground: true });
    }

    return { designed, atsDraft, coverLetter: coverLetterPdf };
  } catch (err) {
    console.error("[render-pdf] fallito, il client riceverà solo il JSON:", err);
    return null;
  } finally {
    await browser?.close().catch(() => {});
  }
}
