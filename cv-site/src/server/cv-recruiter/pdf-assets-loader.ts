/**
 * Provides generated/pdf-assets.json (root del repo, FUORI da cv-site/ — vedi
 * scripts/gen-pdf-assets.mjs per il perché) come oggetto JS già pronto.
 *
 * Import via l'alias Vite "@pdf-assets" (astro.config.mjs), non
 * fs.readFileSync con un path relativo a runtime: quel path veniva calcolato
 * da __dirname/import.meta.url del *chunk bundlato*, non del file sorgente —
 * dopo che esbuild appiattisce l'albero dei moduli in dist/server/chunks/,
 * "../../../../generated/..." non punta più da nessuna parte, e
 * @vercel/nft comunque non tracciava il file per includerlo nel bundle della
 * function (verificato: assente da .vercel/output dopo una build pulita).
 * Un import JSON invece viene inlineato da Vite in fase di build, quindi non
 * resta nessuna lettura da filesystem da rompere a runtime.
 */

import pdfAssets from "@pdf-assets";
import type { PdfAssets } from "@cv-pdf-template";

export const PDF_ASSETS: PdfAssets = pdfAssets;
