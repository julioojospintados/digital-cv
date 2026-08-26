// scripts/qa-design-system.mjs
// Gauntlet deterministico della vetrina /design-system (IT + EN).
//
// Usage: node scripts/qa-design-system.mjs        (o: npm run qa:ds)
// Prerequisito: un server sulla 4321 — `npm run dev --prefix cv-site`
// oppure il build statico servito da .vercel/output/static.
//
// ── Perché esiste ─────────────────────────────────────────────────────────
// La vetrina è una sessantina di pannelli per due lingue: centoventi schermate
// che nessuno ricontrolla
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
  "cursore",
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
        // Gli attributi di servizio non devono finire in ciò che un frontend
        // si porta via — né quelli della vetrina né quelli che `astro dev`
        // inietta per la sua barra degli strumenti, che per giunta portano il
        // percorso assoluto del file sulla macchina di chi sviluppa.
        dirty: codeEl ? /data-(ds|astro)-/.test(codeEl.textContent) : false,
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
    "nessuno snippet porta attributi di servizio",
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

  // ── 6. La voce attiva dell'indice resta in vista ────────────────────────
  // L'indice è più alto del riquadro che lo contiene. Arrivando da un link
  // profondo la voce attiva finiva anche 1097px sotto il bordo, con lo scroll
  // a zero: il pannello giusto c'era, ma l'indice non diceva più dove si era.
  console.log("\n  [6] Voce attiva dell'indice");
  const outOfView = [];
  for (const id of panels) {
    await openPanel(page, id);
    const off = await page.evaluate(() => {
      const side = document.getElementById("ds-side");
      const a = side?.querySelector('[aria-current="page"]');
      if (!side || !a) return null;
      const s = side.getBoundingClientRect();
      const r = a.getBoundingClientRect();
      return Math.round(Math.max(s.top - r.top, r.bottom - s.bottom, 0));
    });
    if (off !== null && off > 0) outOfView.push(`${id} (+${off}px)`);
  }
  check(outOfView.length === 0, "la voce attiva è sempre dentro l'indice", outOfView.join(", "));

  // ── 7. Nessun involucro che schiaccia la demo ───────────────────────────
  // Un involucro tenuto solo per portare `--accent` non deve imporre anche la
  // propria griglia: la demo delle CTA finiva in 422px su 907, con metà palco
  // vuoto. Chi ne ha bisogno porta anche `.ds-ctx` (display: contents).
  console.log("\n  [7] Involucri di contesto");
  const squashed = [];
  for (const id of panels) {
    await openPanel(page, id);
    const bad = await page.evaluate((panelId) => {
      const panel = document.querySelector(`[data-ds-panel="${panelId}"]`);
      const out = [];
      panel.querySelectorAll(".ds-stage .lh-section, .ds-stage .lc-main").forEach((w) => {
        if (getComputedStyle(w).display !== "grid" || w.children.length !== 1) return;
        const own = w.getBoundingClientRect().width;
        const kid = w.children[0].getBoundingClientRect().width;
        if (kid < own * 0.75) out.push(`${Math.round(kid)}/${Math.round(own)}px`);
      });
      return out;
    }, id);
    if (bad.length) squashed.push(`${id}: ${bad.join(", ")}`);
  }
  check(
    squashed.length === 0,
    "nessuna demo schiacciata dal proprio involucro",
    squashed.join(" · "),
  );

  // ── 8. Bersagli di tocco — WCAG 2.2 SC 2.5.8 ───────────────────────────
  // 24×24 CSS px, con l'eccezione "inline": un link dentro una frase è
  // vincolato dall'interlinea del testo che lo circonda e non conta. Qui
  // l'eccezione vale per i contatti in chiaro, che sono una riga di prosa.
  console.log("\n  [8] Bersagli di tocco");
  const tiny = [];
  for (const id of panels) {
    await openPanel(page, id);
    const small = await page.evaluate((panelId) => {
      const panel = document.querySelector(`[data-ds-panel="${panelId}"]`);
      const out = [];
      panel.querySelectorAll(".ds-stage a, .ds-stage button, .ds-stage summary").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        // Eccezione inline: il bersaglio sta dentro un blocco di testo che
        // non è tutto bersaglio.
        const parent = el.parentElement;
        const inSentence =
          parent &&
          getComputedStyle(parent).display === "block" &&
          parent.textContent.trim() !== el.textContent.trim();
        if (inSentence) return;
        if (r.width < 24 || r.height < 24)
          out.push(`${el.className || el.tagName} ${Math.round(r.width)}×${Math.round(r.height)}`);
      });
      return out;
    }, id);
    if (small.length) tiny.push(`${id}: ${[...new Set(small)].join(", ")}`);
  }
  check(tiny.length === 0, "ogni comando è almeno 24×24 (2.5.8)", tiny.join(" · "));

  // ── 9. La pagina ha un h1, su qualunque pannello ────────────────────────
  // I pannelli si scambiano con `hidden`: un titolo dentro un pannello
  // sparisce dall'albero appena se ne sceglie un altro, e la pagina restava
  // senza h1 su 37 pannelli su 38.
  console.log("\n  [9] Titolo della pagina");
  const noH1 = [];
  for (const id of panels) {
    await openPanel(page, id);
    const has = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll("h1")).filter(
        (h) => h.offsetParent !== null || h.closest(".ds-sr"),
      );
      return h1s.some((h) => h.classList.contains("ds-sr"));
    });
    if (!has) noH1.push(id);
  }
  check(noH1.length === 0, "l'h1 della pagina c'è su ogni pannello", noH1.join(", "));

  // ── 10. Spaziatura: i difetti che si vedono a occhio e non si misurano ──
  // Cinque difetti segnalati a mano in una sola sessione erano tutti di
  // questa famiglia, e tutti invisibili a un controllo che guarda solo se
  // gli elementi ci sono. Da qui in poi li trova lo script.
  console.log("\n  [10] Spaziatura");

  const barre = [];
  const sbordi = [];
  const anelli = [];
  const gapIncoerenti = [];

  for (const id of panels) {
    await openPanel(page, id);
    const r = await page.evaluate((panelId) => {
      const panel = document.querySelector(`[data-ds-panel="${panelId}"]`);
      const out = { barre: [], sbordi: [], anelli: [], gap: [] };

      panel.querySelectorAll(".ds-stage").forEach((stage) => {
        const cs = getComputedStyle(stage);
        const bx = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);

        // (a) Una barra di scorrimento VISIBILE ruba spazio al client box.
        //     `scrollHeight > clientHeight` non basta: con overflow hidden
        //     il contenuto è tagliato ma nessuna barra compare.
        const barraV = Math.round(stage.offsetWidth - bx - stage.clientWidth);
        if (barraV > 0) out.barre.push(`${panelId} barra verticale ${barraV}px`);

        // (b) Un elemento che esce dal proprio palco sui lati.
        //     Un palco che taglia di proposito è escluso: la scena knolling
        //     è a pieno vivo e gli oggetti ai bordi escono esattamente come
        //     nella pagina vera — lì il taglio È il componente, non un
        //     difetto di spaziatura.
        const sr = stage.getBoundingClientRect();
        const tagliaDiProposito = cs.overflow === "hidden" || cs.overflowX === "hidden";
        if (!tagliaDiProposito) {
          stage.querySelectorAll("*").forEach((el) => {
            const er = el.getBoundingClientRect();
            if (er.width === 0 || er.height === 0) return;
            const fuoriSx = Math.round(sr.left - er.left);
            if (fuoriSx > 2)
              out.sbordi.push(
                `${panelId} ${el.className || el.tagName} esce a sinistra di ${fuoriSx}px`,
              );
          });
        }

        // (c) L'anello di focus si disegna FUORI dall'elemento: se non ha
        //     spazio attraversa il bordo del palco o la riga accanto.
        stage.querySelectorAll(".is-focus, :focus-visible").forEach((el) => {
          const c = getComputedStyle(el);
          const ring = parseFloat(c.outlineWidth) + parseFloat(c.outlineOffset);
          if (!ring) return;
          const er = el.getBoundingClientRect();
          const sopra = Math.round(er.top - ring - sr.top);
          const sotto = Math.round(sr.bottom - (er.bottom + ring));
          if (sopra < 0 || sotto < 0)
            out.anelli.push(
              `${panelId} anello fuori dal palco (sopra ${sopra}px, sotto ${sotto}px)`,
            );
        });
      });

      // (d) Colonne affiancate: l'aria fra etichetta e contenuto dev'essere
      //     la stessa. È il difetto delle chip — una colonna a 22px e due a
      //     8 — e a occhio si vede solo se si sa cosa cercare.
      panel.querySelectorAll(".ds-stage__row").forEach((row) => {
        const gaps = [...row.querySelectorAll(":scope > .ds-case")]
          .map((c) => {
            const label = c.querySelector(".ds-label");
            const first = [...c.children].find((x) => x !== label);
            if (!label || !first) return null;
            return Math.round(
              first.getBoundingClientRect().top - label.getBoundingClientRect().bottom,
            );
          })
          .filter((g) => g !== null);
        if (gaps.length > 1 && new Set(gaps).size > 1)
          out.gap.push(`${panelId} colonne con aria diversa: ${gaps.join(", ")}px`);
      });

      return out;
    }, id);

    barre.push(...r.barre);
    sbordi.push(...[...new Set(r.sbordi)]);
    anelli.push(...[...new Set(r.anelli)]);
    gapIncoerenti.push(...r.gap);
  }

  check(barre.length === 0, "nessun palco mostra una barra di scorrimento", barre.join(" · "));
  check(
    sbordi.length === 0,
    "nessun elemento esce dal proprio palco",
    sbordi.slice(0, 4).join(" · "),
  );
  check(
    anelli.length === 0,
    "ogni anello di focus sta dentro il palco",
    anelli.slice(0, 4).join(" · "),
  );
  check(
    gapIncoerenti.length === 0,
    "colonne affiancate con la stessa aria fra etichetta e contenuto",
    gapIncoerenti.join(" · "),
  );

  // ── 11. L'indice resta fermo quando la pagina scorre ────────────────────
  // `position: sticky` si aggancia al contenitore di scorrimento più vicino:
  // basta un antenato con overflow diverso da visible perché smetta di
  // funzionare senza che nessuna regola sembri sbagliata. È successo con
  // `body { overflow-x: hidden }`.
  console.log("\n  [11] Indice fermo allo scorrimento");
  // Su un pannello corto la riga della griglia finisce presto e l'indice
  // scorre via *correttamente*: sticky non tiene oltre la propria area. Il
  // controllo ha senso solo dove c'è strada da fare, quindi si apre prima
  // il pannello più alto.
  await openPanel(page, "lente-esperienza");
  const sticky = await page.evaluate(async () => {
    const side = document.getElementById("ds-side");
    if (!side || getComputedStyle(side).position !== "sticky") return null;
    const prima = side.getBoundingClientRect().top;
    window.scrollTo(0, 900);
    await new Promise((r) => setTimeout(r, 400));
    const dopo = side.getBoundingClientRect().top;
    window.scrollTo(0, 0);
    return { prima: Math.round(prima), dopo: Math.round(dopo) };
  });
  check(
    sticky === null || Math.abs(sticky.dopo - sticky.prima) < 4,
    "l'indice resta fermo mentre la pagina scorre",
    sticky ? `da ${sticky.prima}px a ${sticky.dopo}px` : "",
  );

  // ── 12. Console pulita ──────────────────────────────────────────────────
  console.log("\n  [12] Console");
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
