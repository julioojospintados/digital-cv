#!/usr/bin/env node
/**
 * gen-pdf-assets.mjs
 * Genera generated/pdf-assets.json (root del repo): font/QR pre-calcolati in
 * base64, per il renderer PDF serverless (cv-site/src/server/cv-recruiter/render-pdf.ts).
 *
 * JSON puro e FUORI da cv-site/src/ di proposito, non un modulo .js/.ts
 * dentro cv-site — provato entrambi (anche con la riga esclusa via tsconfig
 * "exclude"): una stringa base64 da ~200KB scansionata da `astro check`
 * (Astro language server) manda il processo in OOM in modo affidabile, e
 * l'esclusione tsconfig non basta perché il checker scansiona i file del
 * progetto Astro a prescindere. Tenerlo fuori da cv-site/ del tutto — non
 * solo fuori da src/ — è l'unica cosa che ha funzionato: il progetto Astro
 * non lo vede proprio.
 *
 * Path statico (nome file fisso, non parametrico) di proposito: il problema
 * che questo file risolve — path costruiti a runtime con un peso variabile
 * (lexend-latin-${weight}-normal.woff2) che Vercel non riesce a tracciare in
 * build — non si applica più, perché il chiamante legge sempre lo stesso
 * generated/pdf-assets.json con un path relativo fisso, che Node File Trace
 * individua senza ambiguità.
 *
 * Rilancia questo script solo se i font o il QR cambiano — non gira in CI/build,
 * il suo output è un file versionato in git.
 *
 * Uso: node scripts/gen-pdf-assets.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_FILE = resolve(ROOT, "generated/pdf-assets.json");
mkdirSync(dirname(OUT_FILE), { recursive: true });

const b64 = (path, mime) => `data:${mime};base64,${readFileSync(path).toString("base64")}`;

const lex = (weight) =>
  b64(
    resolve(
      ROOT,
      `cv-site/node_modules/@fontsource/lexend/files/lexend-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );
const jb = (weight) =>
  b64(
    resolve(
      ROOT,
      `cv-site/node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff2`,
    ),
    "font/woff2",
  );

const assets = {
  qr: b64(resolve(ROOT, "cv-site/public/qr/site-qr-dark.png"), "image/png"),
  lex400: lex(400),
  lex600: lex(600),
  lex700: lex(700),
  lex800: lex(800),
  jb500: jb(500),
  jb700: jb(700),
};

writeFileSync(OUT_FILE, JSON.stringify(assets), "utf-8");
console.log(`Generato: ${OUT_FILE} (${(JSON.stringify(assets).length / 1024).toFixed(0)}KB)`);
