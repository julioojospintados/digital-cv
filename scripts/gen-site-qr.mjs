// scripts/gen-site-qr.mjs
// Il QR del sito nello stile della firma: moduli a bastoncino arrotondati
// crema sull'ottanio, occhi a riquadro, marchio GO arancione al centro.
//
// Usage: node scripts/gen-site-qr.mjs <url> <out.png>
//   es. node scripts/gen-site-qr.mjs https://giulio-occhipinti.com/en cv-site/public/qr/site-qr-dark-en.png
//
// Nato il 2026-10-21 per il QR dei CV in inglese, che deve portare a /en:
// site-qr-dark.png, l'unico che c'era, punta alla home italiana, e il file da
// cui era stato disegnato non è nel repo. Il disegno qui riproduce quello: 33
// moduli (versione 4, correzione H), 35px di margine su 640, il riquadro del
// GO che copre il centro — la correzione H regge fino al 30% di moduli persi,
// il riquadro ne copre circa il 9%.
//
// Dopo averlo generato, rilancia `node scripts/gen-pdf-assets.mjs`: il PNG
// finisce in generated/pdf-assets.json per il generatore da telefono.
// Controlla sempre che il QR si legga con un lettore vero prima di usarlo.

import QRCode from "qrcode";
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [url, out] = process.argv.slice(2);
if (!url || !out) {
  console.error("Usage: node scripts/gen-site-qr.mjs <url> <out.png>");
  process.exit(1);
}

const SIZE = 640;
const MARGIN = 35;
const BG = "#084945";
const INK = "#F5F0E6";
const ACCENT = "#FF6B35";

const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
const n = qr.modules.size;
const m = (SIZE - MARGIN * 2) / n;
const dark = (x, y) => x >= 0 && y >= 0 && x < n && y < n && qr.modules.get(y, x) === 1;

// Gli occhi (7×7 negli angoli) si disegnano a parte, come riquadri.
const inEye = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);

// Il riquadro del GO: 11 moduli al centro, liberi.
const BOX = 11;
const c0 = Math.floor((n - BOX) / 2);
const inBox = (x, y) => x >= c0 && x < c0 + BOX && y >= c0 && y < c0 + BOX;

const usable = (x, y) => dark(x, y) && !inEye(x, y) && !inBox(x, y);
// Spessore dei bastoncini, in moduli. Non scendere sotto 0,7: misurato con
// un lettore (jsQR), a 0,66 il codice non si legge più; 0,8 lascia margine
// per la stampa e per le fotocamere peggiori.
const T = m * 0.8;
const shapes = [];
const taken = new Set();
const key = (x, y) => `${x},${y}`;

// Prima le corse verticali di almeno due moduli, come nel disegno originale…
for (let x = 0; x < n; x++) {
  let y = 0;
  while (y < n) {
    if (!usable(x, y)) {
      y++;
      continue;
    }
    let e = y;
    while (usable(x, e + 1)) e++;
    if (e > y) {
      for (let i = y; i <= e; i++) taken.add(key(x, i));
      const len = (e - y + 1) * m - (m - T);
      shapes.push(
        `<rect x="${MARGIN + x * m + (m - T) / 2}" y="${MARGIN + y * m + (m - T) / 2}" width="${T}" height="${len}" rx="${T / 2}"/>`,
      );
    }
    y = e + 1;
  }
}
// …poi le orizzontali fra i moduli rimasti…
for (let y = 0; y < n; y++) {
  let x = 0;
  while (x < n) {
    if (!usable(x, y) || taken.has(key(x, y))) {
      x++;
      continue;
    }
    let e = x;
    while (usable(e + 1, y) && !taken.has(key(e + 1, y))) e++;
    if (e > x) {
      for (let i = x; i <= e; i++) taken.add(key(i, y));
      const len = (e - x + 1) * m - (m - T);
      shapes.push(
        `<rect x="${MARGIN + x * m + (m - T) / 2}" y="${MARGIN + y * m + (m - T) / 2}" width="${len}" height="${T}" rx="${T / 2}"/>`,
      );
    }
    x = e + 1;
  }
}
// …e i moduli soli come punti.
for (let y = 0; y < n; y++)
  for (let x = 0; x < n; x++)
    if (usable(x, y) && !taken.has(key(x, y)))
      shapes.push(
        `<circle cx="${MARGIN + (x + 0.5) * m}" cy="${MARGIN + (y + 0.5) * m}" r="${T / 2}"/>`,
      );

const eye = (ex, ey) => {
  const x = MARGIN + ex * m;
  const y = MARGIN + ey * m;
  return `<rect x="${x + m / 2}" y="${y + m / 2}" width="${6 * m}" height="${6 * m}" rx="${m * 0.6}" fill="none" stroke="${INK}" stroke-width="${m}"/>
<rect x="${x + 2 * m}" y="${y + 2 * m}" width="${3 * m}" height="${3 * m}" rx="${m * 0.5}"/>`;
};

const bx = MARGIN + c0 * m + m * 0.5;
const bs = BOX * m - m;
const lexend = readFileSync(
  resolve(ROOT, "cv-site/node_modules/@fontsource/lexend/files/lexend-latin-800-normal.woff2"),
).toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
<rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
<g fill="${INK}">${shapes.join("")}${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}</g>
<rect x="${bx}" y="${bx}" width="${bs}" height="${bs}" rx="${m * 1.6}" fill="${BG}" stroke="${INK}" stroke-width="${m * 0.42}"/>
<text x="${SIZE / 2}" y="${SIZE / 2}" dy="0.35em" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="${m * 4.3}" letter-spacing="-0.03em" fill="${ACCENT}">GO</text>
</svg>`;

const html = `<!doctype html><html><head><style>
@font-face{font-family:Lexend;font-weight:800;src:url(data:font/woff2;base64,${lexend}) format("woff2");}
html,body{margin:0;background:${BG}}
</style></head><body>${svg}</body></html>`;

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch(executablePath ? { executablePath } : undefined);
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
writeFileSync(resolve(ROOT, out), await page.screenshot({ type: "png" }));
await browser.close();
console.log(`QR ${url} → ${out} (versione ${qr.version}, ${n}×${n})`);
