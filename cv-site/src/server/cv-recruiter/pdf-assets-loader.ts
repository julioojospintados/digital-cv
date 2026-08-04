/**
 * Legge generated/pdf-assets.json (root del repo, FUORI da cv-site/ — vedi
 * scripts/gen-pdf-assets.mjs per il perché) a runtime, con un path relativo
 * statico (nessuna interpolazione) così Vercel/Node File Trace lo include nel
 * bundle della funzione senza ambiguità — lo stesso problema che il path
 * parametrico per peso font aveva altrove (vedi cv-pdf-template.ts).
 */

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { PdfAssets } from "@cv-pdf-template";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_PATH = resolve(__dirname, "../../../../generated/pdf-assets.json");

export const PDF_ASSETS: PdfAssets = JSON.parse(readFileSync(ASSETS_PATH, "utf-8")) as PdfAssets;
