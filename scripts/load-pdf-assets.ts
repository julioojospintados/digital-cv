/**
 * load-pdf-assets.ts
 * Legge font/QR da disco e li impacchetta in un PdfAssets — SOLO per contesti
 * CLI Node con filesystem locale (scripts/generate-ux-cv.ts,
 * scripts/generate-targeted-cv.ts). Non importare questo file da un contesto
 * serverless: usa invece cv-site/src/server/cv-recruiter/pdf-assets.ts
 * (asset pre-calcolati, nessun readFileSync a runtime — vedi
 * scripts/gen-pdf-assets.mjs).
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import type { PdfAssets } from "./cv-pdf-template.js";

const b64 = (path: string, mime: string): string =>
  `data:${mime};base64,${readFileSync(path).toString("base64")}`;

const lex = (root: string, weight: number): string =>
  b64(
    resolve(
      root,
      `cv-site/node_modules/@fontsource/lexend/files/lexend-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );
const jb = (root: string, weight: number): string =>
  b64(
    resolve(
      root,
      `cv-site/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );

/** `root` è la root del repo (dirname(fileURLToPath(import.meta.url)) + "/.."  dal chiamante). */
export function loadPdfAssets(root: string): PdfAssets {
  return {
    qr: b64(resolve(root, "cv-site/public/qr/site-qr-dark.png"), "image/png"),
    lex400: lex(root, 400),
    lex600: lex(root, 600),
    lex700: lex(root, 700),
    lex800: lex(root, 800),
    jb500: jb(root, 500),
    jb700: jb(root, 700),
  };
}
