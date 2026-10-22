// scripts/qa-parity.mjs
// Le pagine italiane e inglesi devono differire per la sola lingua.
//
// Usage: npm run qa:parity        (richiede un server: QA_BASE_URL, default 4321)
//
// ── Cosa misura, e perché così ────────────────────────────────────────────
// Non confronta i testi: quelli DEVONO differire. Confronta la **struttura**:
// quante volte compare ogni classe nella pagina, più la lente applicata, la
// lingua dichiarata, dove porta lo switch di lingua e gli hreflang. Se una
// delle due lingue perde un blocco per strada, i conteggi si scollano; se
// invece è solo tradotta, restano identici.
//
// Ha già trovato un difetto vero al primo giro: `data-mode` era assente su
// tutte le pagine /en/<lente>, perché lo store leggeva la lente dal primo
// segmento del path, che lì vale "en". Sintomo in produzione: colore corretto
// in SSR e pagina bianca dopo l'idratazione. Non lo vedeva nessun altro
// controllo, e a occhio si nota solo se guardi la pagina giusta.
//
// ── Su quali pagine ───────────────────────────────────────────────────────
// Tutte le coppie che esistono nel build (scripts/qa-pages.mjs). Fino al
// 2026-10-22 erano le tre lenti e l'ingresso, con sei conteggi scelti a mano:
// /work, i case study, l'informativa e la vetrina non le confrontava nessuno.
// Ora le coppie si scoprono dal build e si confrontano tutte le classi, così
// una pagina nuova o un componente nuovo entrano nel controllo da soli. Le
// pagine senza gemella per costruzione (la 404, gli strumenti privati) restano
// fuori dalle coppie ma non dal controllo degli errori in console.

import { chromium } from "playwright";
import { tuttePagine, coppie, gemella } from "./qa-pages.mjs";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4321";

// La lente attesa su /<lente> e /en/<lente>: lo slug dell'URL non è la
// chiave interna (cv-i18n.ts), ed è proprio lì che si era rotto.
const MODE_ATTESO = { "/design/": "creative", "/tech/": "tech", "/ai/": "human" };

// Stessa convenzione di qa-design-system.mjs: se la revisione di Chromium
// che Playwright cerca non è installata, se ne indica una che c'è.
const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : undefined);
let falliti = 0;
const ok = (cond, testo, extra = "") => {
  console.log(`  ${cond ? "✅" : "❌"} ${testo}${cond || !extra ? "" : ` — ${extra}`}`);
  if (!cond) falliti++;
};

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(() => {
  try {
    sessionStorage.setItem("go-intro-seen", "1");
  } catch {
    // storage bloccato: l'intro gira compressa, la struttura non cambia
  }
});

async function misura(path) {
  const page = await ctx.newPage();
  const errori = [];
  page.on("pageerror", (e) => errori.push(String(e)));
  // Le richieste fallite si contano dall'URL, non dal messaggio di console:
  // "Failed to load resource: 404" non dice *quale* risorsa, e senza l'URL
  // non si può distinguere un difetto vero dagli script di Vercel
  // (/_vercel/insights, /_vercel/speed-insights), che esistono solo una volta
  // deployati e in locale danno 404 su ogni pagina del sito. La 404 stessa
  // risponde 404 per definizione: lo stato della pagina non è un errore.
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/_vercel/") && r.url() !== BASE + path)
      errori.push(`${r.status()} ${r.url()}`);
  });
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const classi = {};
    for (const el of document.querySelectorAll("[class]"))
      for (const c of el.classList) if (!c.startsWith("astro-")) classi[c] = (classi[c] ?? 0) + 1;
    return {
      lang: document.documentElement.lang,
      mode: document.documentElement.dataset.mode ?? "",
      classi,
      lingua: document.querySelector(".lang-switch a")?.getAttribute("href") ?? null,
      hreflang: document.querySelectorAll('link[rel="alternate"][hreflang]').length,
    };
  });
  await page.close();
  return { ...r, status: res?.status() ?? 0, errori };
}

const norm = (p) => (p && p !== "/" ? p.replace(/\/$/, "") : p);
const pagine = tuttePagine();
const elenco = coppie(pagine);
console.log(`\n  Parità IT ↔ EN — ${elenco.length} coppie su ${pagine.length} pagine — ${BASE}\n`);

const conErrori = [];
for (const [pIt, pEn] of elenco) {
  const it = await misura(pIt);
  const en = await misura(pEn);
  for (const [p, m] of [
    [pIt, it],
    [pEn, en],
  ])
    if (m.errori.length) conErrori.push(`${p}: ${m.errori[0]}`);

  console.log(`  [${pIt} ↔ ${pEn}]`);
  ok(it.status === 200 && en.status === 200, "entrambe rispondono", `${it.status}/${en.status}`);
  ok(
    it.lang === "it" && en.lang === "en",
    "ogni pagina dichiara la propria lingua",
    `${it.lang}/${en.lang}`,
  );
  const atteso = MODE_ATTESO[pIt];
  ok(
    it.mode === en.mode && (!atteso || it.mode === atteso),
    `stessa lente nelle due lingue${atteso ? ` (${atteso})` : ""}`,
    `${it.mode || "assente"}/${en.mode || "assente"}`,
  );
  const tutte = new Set([...Object.keys(it.classi), ...Object.keys(en.classi)]);
  const scollate = [...tutte]
    .filter((c) => (it.classi[c] ?? 0) !== (en.classi[c] ?? 0))
    .map((c) => `${c}: ${it.classi[c] ?? 0}≠${en.classi[c] ?? 0}`);
  ok(scollate.length === 0, "stessa struttura nelle due lingue", scollate.slice(0, 8).join(", "));
  if (it.lingua !== null || en.lingua !== null)
    ok(
      norm(it.lingua) === norm(pEn) && norm(en.lingua) === norm(pIt),
      "lo switch porta alla stessa pagina nell'altra lingua",
      `${it.lingua}/${en.lingua}`,
    );
  ok(
    it.hreflang === en.hreflang && (!atteso || it.hreflang === 3),
    `stessi hreflang nelle due lingue${atteso ? " (it/en/x-default)" : ""}`,
    `${it.hreflang}/${en.hreflang}`,
  );
}

// Le pagine senza gemella: niente da confrontare, ma nessun errore ammesso.
for (const p of pagine.filter((p) => !elenco.some(([a, b]) => a === p || b === p))) {
  const m = await misura(p);
  if (m.errori.length) conErrori.push(`${p}: ${m.errori[0]}`);
  console.log(`  [${p}] senza gemella${gemella(p) ? `, ${gemella(p)} non esiste` : ""}`);
}

console.log("");
ok(conErrori.length === 0, "nessun errore in console su nessuna pagina", conErrori.join(" | "));

await browser.close();
console.log(`\n  ${falliti === 0 ? "✅ parità verificata" : `❌ ${falliti} controlli falliti`}\n`);
process.exit(falliti === 0 ? 0 : 1);
