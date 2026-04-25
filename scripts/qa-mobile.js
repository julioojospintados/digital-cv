// scripts/qa-mobile.js
// QA mobile emulation sul sito reale (Astro dev server)
// Usage: node scripts/qa-mobile.js
// Prerequisito: npm run dev --prefix cv-site (porta 4321)

import { chromium, devices } from 'playwright';

const BASE_URL = 'http://localhost:4321';
const DEVICES_TO_TEST = ['iPhone 14', 'Pixel 7'];

const ROUTES = ['/', '/home', '/tech', '/creative', '/human', '/management'];

let passed = 0;
let failed = 0;

function ok(msg) {
  console.log(`  ✅ ${msg}`);
  passed++;
}
function fail(msg) {
  console.error(`  ❌ ${msg}`);
  failed++;
}

async function runOnDevice(browser, deviceName) {
  console.log(`\n📱 Device: ${deviceName}`);
  const context = await browser.newContext({ ...devices[deviceName] });
  const page = await context.newPage();

  // ── 1. Preloader / index ──────────────────────────────────────────
  console.log('\n  [1] Preloader — /');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const title = await page.title();
  title ? ok(`Pagina caricata — title: "${title}"`) : fail('Pagina non caricata');

  // ── 2. Home — mode cards ─────────────────────────────────────────
  console.log('\n  [2] Home — /home');
  await page.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle' });
  const modeCards = await page.locator('[data-mode]').count();
  modeCards >= 4
    ? ok(`Mode cards trovate: ${modeCards}`)
    : fail(`Mode cards insufficienti: ${modeCards} (attese ≥4)`);

  // ── 3. Lenis smooth scroll — /tech ───────────────────────────────
  console.log('\n  [3] Lenis smooth scroll — /tech');
  await page.goto(`${BASE_URL}/tech`, { waitUntil: 'networkidle' });

  // Lenis si inizializza su window — verifica che non lanci errori JS
  const jsErrors = [];
  page.on('pageerror', (err) => jsErrors.push(err.message));

  // Simula scroll touch
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
  await page.waitForTimeout(800);
  const scrollY = await page.evaluate(() => window.scrollY);
  scrollY > 0
    ? ok(`Scroll funzionante — scrollY: ${scrollY}px`)
    : fail('Scroll bloccato — scrollY rimasto a 0');

  // ── 4. Touch events — nessun blocco touch-action ─────────────────
  console.log('\n  [4] Touch action — /tech');
  // Verifica che i link e bottoni siano cliccabili senza delay
  const firstLink = page.locator('a').first();
  const linkBox = await firstLink.boundingBox();
  linkBox
    ? ok(`Link cliccabile — posizione: ${JSON.stringify(linkBox)}`)
    : fail('Nessun link trovato sulla pagina');

  // ── 5. Grafo skill — SkillForceGraph ─────────────────────────────
  console.log('\n  [5] Grafo skill — skill-force-graph');
  const graph = page.locator('skill-force-graph');
  const graphExists = (await graph.count()) > 0;
  if (graphExists) {
    ok('Elemento <skill-force-graph> presente');
    // Verifica che sia visibile (non nascosto)
    const visible = await graph.first().isVisible();
    visible ? ok('Grafo visibile') : fail('Grafo presente ma non visibile');

    // Bottone espandi grafo — dentro Shadow DOM del Lit component, Playwright lo pierces automaticamente
    const expandBtn = page.locator('.graph-expand-btn');
    const btnCount = await expandBtn.count();
    if (btnCount > 0) {
      ok(`Bottone espandi trovato (${btnCount})`);
    } else {
      // Fallback: cerca per aria-label (Playwright pierces shadow DOM)
      const expandByLabel = page.getByRole('button', { name: /espandi grafico/i });
      const byLabelCount = await expandByLabel.count();
      byLabelCount > 0
        ? ok(`Bottone espandi trovato via aria-label (${byLabelCount})`)
        : fail('Bottone espandi NON trovato — shadow DOM non pierced o elemento assente');
    }
  } else {
    fail('<skill-force-graph> non trovato su /tech');
  }

  // ── 6. Accordion esperienze — cluster header + exp-deeper-btn ───
  console.log('\n  [6] Accordion esperienze');
  // I cluster usano .exp-cluster__header; il "Go Deeper" usa .exp-deeper-btn
  const clusterHeaders = page.locator('.exp-cluster__header');
  const deeperBtn = page.locator('.exp-deeper-btn');
  const clusterCount = await clusterHeaders.count();
  const deeperCount = await deeperBtn.count();
  if (clusterCount > 0) {
    ok(`Cluster headers (accordion) trovati: ${clusterCount}`);
    // Clicca il primo cluster chiuso
    const closedCluster = clusterHeaders.first();
    await closedCluster.click();
    await page.waitForTimeout(400);
    ok('Click cluster accordion eseguito senza errori');
  } else {
    fail('.exp-cluster__header NON trovato su /tech');
  }
  deeperCount > 0
    ? ok(`Bottone "Go Deeper" trovato: ${deeperCount}`)
    : fail('.exp-deeper-btn NON trovato — accordion esperienze assente');

  // ── 7. JS errors check ───────────────────────────────────────────
  console.log('\n  [7] Errori JS');
  jsErrors.length === 0
    ? ok('Nessun errore JS rilevato')
    : fail(`${jsErrors.length} errori JS:\n    ${jsErrors.join('\n    ')}`);

  // ── 8. Viewport corretto ─────────────────────────────────────────
  console.log('\n  [8] Viewport mobile');
  const vp = page.viewportSize();
  vp && vp.width <= 430
    ? ok(`Viewport mobile corretto: ${vp.width}×${vp.height}`)
    : fail(`Viewport non mobile: ${JSON.stringify(vp)}`);

  await context.close();
}

(async () => {
  const browser = await chromium.launch();

  for (const deviceName of DEVICES_TO_TEST) {
    await runOnDevice(browser, deviceName);
  }

  await browser.close();

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`QA Mobile completato — ✅ ${passed} passed  ❌ ${failed} failed`);
  console.log('─'.repeat(50));

  if (failed > 0) process.exit(1);
})();
