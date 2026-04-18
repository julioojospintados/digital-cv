/**
 * gen-og-image.mjs
 * Genera cv-site/public/og-image.png (1200×630) per i meta tag Open Graph.
 *
 * Prerequisiti:
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 * Uso:
 *   1. Assicurati che il sito giri in locale (es. npm run dev --prefix cv-site → http://localhost:4321)
 *   2. node scripts/gen-og-image.mjs [URL]      (default: http://localhost:4321/tech)
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '../cv-site/public/og-image.png');
const TARGET_URL = process.argv[2] ?? 'http://localhost:4321/';

console.log(`📸 Cattura screenshot da: ${TARGET_URL}`);
console.log(`💾 Output: ${OUT_PATH}`);

const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });

// Sposta il mouse fuori dal viewport prima ancora che la pagina carichi
await page.mouse.move(1300, 700);

await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

// Inietta subito CSS per nascondere elementi UI non desiderati
await page.addStyleTag({
  content: `
    #cursor-ring,
    #cursor-dot,
    floating-menu,
    go-logo,
    .skip-link,
    #preloader,
    .preloader,
    .bg-knoll {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `
});

// Attendi che il preloader GSAP finisca e la home sia visibile
await page.waitForTimeout(4500);

// Forza rimozione dal DOM dopo che Lit ha montato i componenti
await page.evaluate(() => {
  ['#cursor-ring', '#cursor-dot', 'floating-menu', 'go-logo', '.skip-link'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.parentNode?.removeChild(el));
  });
});

await page.screenshot({
  path: OUT_PATH,
  type: 'png',
  clip: { x: 0, y: 0, width: 1200, height: 600 },
});
await browser.close();

if (existsSync(OUT_PATH)) {
  console.log('✅ og-image.png generata correttamente.');
} else {
  console.error('❌ File non creato. Controlla gli errori sopra.');
  process.exit(1);
}
