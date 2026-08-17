// scripts/qa-design-system.mjs
// Gauntlet deterministico della vetrina /design-system (IT + EN).
//
// Usage: node scripts/qa-design-system.mjs        (o: npm run qa:ds)
// Prerequisito: un server sulla 4321 — `npm run dev --prefix cv-site`
// oppure il build statico servito da .vercel/output/static.
//
// ── Perché esiste ─────────────────────────────────────────────────────────
// La vetrina è 38 pannelli per due lingue: 76 schermate che nessuno ricontrolla
// a mano dopo ogni modifica. Quasi tutto ciò che può rompersi qui è però
// *decidibile* — la parità IT/EN, la corrispondenza fra indice e pannelli, la
// presenza di scheda e snippet, un errore in console, una barra di scorrimento
// orizzontale su mobile. Roba da script, non da giudizio.
//
// Il confine è quello: qui sta solo ciò che si può dimostrare falso. Se una
// demo è *brutta*, o se un componente è documentato con la classe sbagliata
// (è successo davvero: lab-label mostrata come etichetta di testo quando è il
// blocco caption del caso), questo file non se ne accorge e non deve fingere
// di poterlo fare. Quella metà del lavoro sta in
// `.claude/skills/verification-loop/SKILL.md`.
//
// Gemello di scripts/qa-mobile.js: stesso schema, stesso stile di output,
// stesso codice d'uscita 1 se qualcosa fallisce.

import { chromium } from "playwright";

const BASE_URL = process.env.QA_BASE_URL ?? "http://localhost:4321";
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

// I due percorsi devono restare gemelli: stessa struttura, stesso ordine,
// stesso stato iniziale. Solo la lingua cambia (AGENTS.md § IT ↔ EN parity).
const PAGES = [
  { lang: "it", path: "/design-system" },
  { lang: "en", path: "/en/design-system" },
];

// I pannelli che NON sono componenti: tabelle di riferimento e introduzione.
// Da loro non si pretende né scheda né snippet.
const REFERENCE_PANELS = new Set([
  "intro",
  "colore",
  "tipografia",
  "forma",
  "movimento",
  "stati",
  "mobile",
  "animazioni",
  "accessibilita",
]);

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

function check(condition, message, detail) {
  if (condition) ok(message);
  else fail(detail ? `${message} — ${detail}` : message);
}

/** Apre un pannello e aspetta che lo script abbia finito di scambiarli. */
async function openPanel(page, id) {
  await page.evaluate((panelId) => {
    window.location.hash = `#${panelId}`;
  }, id);
  await page.waitForFunction(
    (panelId) => document.querySelector(`[data-ds-panel="${panelId}"]`)?.hidden === false,
    id,
    { timeout: 2000 },
  );
}

async function auditPage(browser, { lang, path }) {
  console.log(`\n📄 ${path} (${lang})`);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Un errore in console è un difetto, non rumore: la vetrina non ne ha
  // nessuno oggi, e il momento in cui ne compare uno è il momento in cui
  // qualcosa ha smesso di funzionare senza dirlo.
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    // «Failed to load resource» è l'eco di una richiesta fallita, e arriva
    // senza dire quale: l'indirizzo sta in requestfailed, qui sotto. Tenerlo
    // anche in console significherebbe contare due volte lo stesso problema
    // e non poterlo filtrare, perché il testo da solo non nomina niente.
    if (m.text().startsWith("Failed to load resource")) return;
    problems.push(`console: ${m.text()}`);
  });
  page.on("requestfailed", (r) => {
    // Gli analytics di Vercel: in dev arrivano da va.vercel-scripts.com, in
    // preview dal percorso /_vercel/. Fuori da Vercel — o dietro un proxy —
    // falliscono sempre, e non sono un difetto della pagina. È l'unica
    // esclusione di questo file, ed è per host, non per messaggio.
    if (r.url().includes("va.vercel-scripts.com") || r.url().includes("/_vercel/")) return;
    problems.push(`richiesta fallita: ${r.url()}`);
  });

  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  check(response?.ok(), `la pagina risponde`, `HTTP ${response?.status()}`);

  // ── 1. Indice e pannelli si corrispondono ───────────────────────────────
  console.log("\n  [1] Indice ↔ pannelli");
  const panels = await page.$$eval("[data-ds-panel]", (els) => els.map((el) => el.dataset.dsPanel));
  const navEntries = await page.$$eval("[data-ds-nav]", (els) => els.map((el) => el.dataset.dsNav));
  const orphanPanels = panels.filter((id) => !navEntries.includes(id));
  const orphanNav = navEntries.filter((id) => !panels.includes(id));

  check(orphanPanels.length === 0, "ogni pannello ha una voce d'indice", orphanPanels.join(", "));
  check(orphanNav.length === 0, "ogni voce d'indice ha un pannello", orphanNav.join(", "));
  check(
    navEntries.join("|") === panels.join("|"),
    "indice e pannelli sono nello stesso ordine",
    `indice: ${navEntries.join(",")} / pannelli: ${panels.join(",")}`,
  );

  // ── 2. Un pannello per volta ────────────────────────────────────────────
  console.log("\n  [2] Selezione del pannello");
  const visibleAtStart = await page.$$eval("[data-ds-panel]", (els) =>
    els.filter((el) => !el.hidden).map((el) => el.dataset.dsPanel),
  );
  check(
    visibleAtStart.length === 1 && visibleAtStart[0] === "intro",
    "senza hash si atterra sull'introduzione, da sola",
    visibleAtStart.join(", "),
  );

  await page.goto(`${BASE_URL}${path}#non-esiste`, { waitUntil: "networkidle" });
  const fallback = await page.$$eval("[data-ds-panel]", (els) =>
    els.filter((el) => !el.hidden).map((el) => el.dataset.dsPanel),
  );
  check(
    fallback.length === 1 && fallback[0] === "intro",
    "un hash sconosciuto ripiega sull'introduzione",
    fallback.join(", "),
  );

  // ── 3. Ogni componente ha scheda, snippet e comando di copia ────────────
  console.log("\n  [3] Scheda, snippet, copia");
  const missing = { spec: [], code: [], copy: [], dirty: [], multiVisible: [] };

  for (const id of panels) {
    await openPanel(page, id);

    const state = await page.evaluate((panelId) => {
      const el = document.querySelector(`[data-ds-panel="${panelId}"]`);
      const codeEl = el.querySelector(".ds-code__pre code");
      return {
        spec: !!el.querySelector(".ds-spec"),
        code: !!codeEl,
        copy: !!el.querySelector(".ds-code__copy"),
        // Gli attributi di servizio della vetrina non devono finire in ciò
        // che un frontend si porta via.
        dirty: codeEl ? /data-ds-/.test(codeEl.textContent) : false,
        visible: Array.from(document.querySelectorAll("[data-ds-panel]")).filter((p) => !p.hidden)
          .length,
      };
    }, id);

    if (state.visible !== 1) missing.multiVisible.push(`${id} (${state.visible})`);
    if (state.dirty) missing.dirty.push(id);
    if (REFERENCE_PANELS.has(id)) continue;
    if (!state.spec) missing.spec.push(id);
    if (!state.code) missing.code.push(id);
    if (!state.copy) missing.copy.push(id);
  }

  check(
    missing.multiVisible.length === 0,
    "resta visibile un pannello solo",
    missing.multiVisible.join(", "),
  );
  check(
    missing.spec.length === 0,
    "ogni componente ha la scheda di specifica",
    missing.spec.join(", "),
  );
  check(missing.code.length === 0, "ogni componente ha lo snippet", missing.code.join(", "));
  check(missing.copy.length === 0, "ogni snippet ha il comando di copia", missing.copy.join(", "));
  check(
    missing.dirty.length === 0,
    "nessuno snippet porta attributi data-ds-",
    missing.dirty.join(", "),
  );

  // ── 4. Anatomia: elenco e parti si corrispondono ────────────────────────
  console.log("\n  [4] Anatomia");
  const anatomyPanels = await page.$$eval("[data-ds-anatomy]", (els) =>
    els.map((el) => el.closest("[data-ds-panel]").dataset.dsPanel),
  );
  check(anatomyPanels.length > 0, `i pannelli con anatomia sono ${anatomyPanels.length}`);

  for (const id of anatomyPanels) {
    await openPanel(page, id);
    const panel = page.locator(`[data-ds-panel="${id}"]`);
    const parts = await panel.locator(".ds-stage [data-ds-part]").count();
    const items = await panel.locator(".ds-anatomy__item").count();
    check(
      parts === items,
      `${id}: parti marcate e voci d'elenco coincidono`,
      `${parts} ≠ ${items}`,
    );

    await panel.locator(".ds-anatomy__toggle").click();
    const badgesOn = await panel.locator(".ds-anatomy__badge").count();
    await panel.locator(".ds-anatomy__toggle").click();
    const badgesOff = await panel.locator(".ds-anatomy__badge").count();
    check(
      badgesOn === parts && badgesOff === 0,
      `${id}: i numeri compaiono e spariscono col comando`,
      `accesi ${badgesOn}/${parts}, spenti ${badgesOff}`,
    );
  }

  // ── 5. Niente scorrimento orizzontale, a nessuna larghezza ──────────────
  console.log("\n  [5] Nessuna barra orizzontale");
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflowing = [];
    for (const id of panels) {
      await openPanel(page, id);
      const over = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      if (over) overflowing.push(id);
    }
    check(
      overflowing.length === 0,
      `${width}px: nessun pannello sfora in larghezza`,
      overflowing.join(", "),
    );
  }
  await page.setViewportSize({ width: 1280, height: 900 });

  // ── 6. Console pulita ───────────────────────────────────────────────────
  console.log("\n  [6] Console");
  check(problems.length === 0, "nessun errore in console", problems.slice(0, 3).join(" | "));

  await context.close();
  return panels;
}

async function main() {
  const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : undefined);
  const perLang = {};

  try {
    for (const target of PAGES) {
      perLang[target.lang] = await auditPage(browser, target);
    }

    // ── 7. Parità IT ↔ EN ─────────────────────────────────────────────────
    // Non «le stesse quantità»: gli stessi id nello stesso ordine. È la
    // regola che questo progetto ha già visto cedere più volte, ed è l'unica
    // che un solo componente parametrico per lingua rende impossibile da
    // violare — questo controllo è la prova che sia rimasto così.
    console.log("\n🌍 Parità IT ↔ EN");
    check(
      perLang.it.join("|") === perLang.en.join("|"),
      "stessi pannelli, stesso ordine nelle due lingue",
      `IT ${perLang.it.length} / EN ${perLang.en.length}`,
    );
  } finally {
    await browser.close();
  }

  console.log(`\n${"─".repeat(58)}`);
  console.log(`  ✅ ${passed} verifiche passate   ❌ ${failed} fallite`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\n❌ Il gauntlet non è potuto partire: ${error.message}`);
  console.error("   Serve un server sulla 4321 — npm run dev --prefix cv-site");
  process.exitCode = 1;
});
