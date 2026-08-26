/**
 * gen-og-image.mjs
 * Rigenera cv-site/public/og-cover.jpg (1200×630) per i meta tag Open Graph.
 *
 * ── Perché JPEG e non PNG ────────────────────────────────────────────────
 * WhatsApp scarta le immagini og sopra i ~300KB: l'anteprima non compare e
 * basta, senza dire perché. Uno screenshot PNG di questa home ne pesa oltre
 * il triplo. In JPEG a qualità 82 sta sui 90KB, che è il file servito oggi.
 *
 * Fino al 2026-08-26 questo script scriveva `og-image.png`, un file che non
 * esiste più: il nome era stato cambiato in `og-cover.jpg` per fare cache
 * busting sulle anteprime già condivise, e lo script non era stato
 * aggiornato. Nascondeva anche `#cursor-ring` e `#cursor-dot`, che sono i
 * nomi del cursore di prima della riscrittura a lampada.
 *
 * Prerequisiti:
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Uso:
 *   1. Il sito deve girare in locale (npm run dev --prefix cv-site)
 *   2. node scripts/gen-og-image.mjs [URL]   (default: http://localhost:4321/)
 */

import { chromium } from "playwright";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { existsSync, statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "../cv-site/public/og-cover.jpg");
const TARGET_URL = process.argv[2] ?? "http://localhost:4321/";

// Il tetto oltre cui WhatsApp smette di mostrare l'anteprima. Non è un
// limite di stile: è la ragione per cui questo file è un JPEG.
const MAX_KB = 300;

console.log(`📸 Cattura screenshot da: ${TARGET_URL}`);
console.log(`💾 Output: ${OUT_PATH}`);

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });

// Sposta il mouse fuori dal viewport prima ancora che la pagina carichi: il
// cursore-lampada illumina la scena da dove sta il puntatore, e un alone in
// mezzo all'immagine si porterebbe dietro anche le ombre degli oggetti.
await page.mouse.move(1300, 700);

await page.goto(TARGET_URL, { waitUntil: "networkidle" });

// Nasconde gli elementi di interfaccia che non appartengono a un'anteprima.
await page.addStyleTag({
  content: `
    #cursor-core,
    #cursor-lamp,
    floating-menu,
    go-logo,
    .skip-link {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `,
});

// L'ingresso ha un'animazione GSAP: si aspetta che sia finita, altrimenti
// si fotografa il nome a metà strada.
await page.waitForTimeout(4500);

// Rimozione dal DOM dopo che Lit ha montato i componenti: il CSS qui sopra
// arriva prima della definizione degli elementi custom, che potrebbero
// ridipingersi dopo.
await page.evaluate(() => {
  ["#cursor-core", "#cursor-lamp", "floating-menu", "go-logo", ".skip-link"].forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => el.parentNode?.removeChild(el));
  });
});

await page.screenshot({
  path: OUT_PATH,
  type: "jpeg",
  quality: 82,
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});
await browser.close();

if (!existsSync(OUT_PATH)) {
  console.error("❌ File non creato. Controlla gli errori sopra.");
  process.exit(1);
}

const kb = Math.round(statSync(OUT_PATH).size / 1024);
console.log(`✅ og-cover.jpg generata: 1200×630, ${kb}KB.`);
if (kb > MAX_KB) {
  console.error(
    `❌ ${kb}KB supera i ${MAX_KB}KB oltre cui WhatsApp non mostra l'anteprima.\n` +
      `   Abbassa \`quality\` qui sopra e rigenera.`,
  );
  process.exit(1);
}
