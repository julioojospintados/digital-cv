// scripts/qa-viewports.mjs
// Le misure di schermo vere dei visitatori, non quelle comode da provare.
//
// Usage: npm run qa:viewports      (richiede un server: QA_BASE_URL, default 4321)
//
// ── Perché esiste ─────────────────────────────────────────────────────────
// Il 2026-10-20 un controllo fatto a mano sulle finestre reali dei visitatori
// (PostHog, ultimi 90 giorni) ha trovato un difetto grave che nessun altro
// controllo vedeva: sul portatile più comune dopo il 1920×1080 — un
// 1366×768, che con le barre del browser lascia una finestra alta 560-610px —
// le schede dell'ingresso erano più alte della finestra e i bottoni restavano
// sotto il bordo. «Chi sono» a 642px su 610; a 1030×560 tutte e quattro fra
// 595 e 673px su 560. La prima schermata di ogni scheda non aveva un'azione.
//
// Gli altri controlli guardano a 1280×900, 1440×900 e 390px: misure in cui
// il problema non esiste. Questo guarda dove esiste.
//
// ── Cosa verifica ─────────────────────────────────────────────────────────
// 1. Ogni scheda dell'ingresso (IT ed EN), arrivata in cima alla pila, ha i
//    bottoni interi dentro la finestra, con 16px di margine: è la corsa
//    della parallasse del testo (lab-home-scroll.ts), che a movimento
//    normale li sposta fino a 14px.
// 2. Su desktop, l'invito della prima card di /work («Leggi il Case
//    study») sta nella prima schermata, IT ed EN: stesso difetto, trovato
//    dall'agente ux-reviewer lo stesso giorno (659-692px su 610).
//    Sui telefoni non ancora: è segnato, non corretto (seconda fascia).
// 3. Nessuna pagina principale scorre in orizzontale.
//
// ── Le misure ─────────────────────────────────────────────────────────────
// Prese dalle finestre desktop reali (PostHog, 2026-10-20), più i telefoni
// già usati negli altri controlli. Se i dati cambiano, si aggiornano qui:
// un controllo che non cresce col sito invecchia come una fotografia.

import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4321";

const DESKTOP = [
  [1920, 1080],
  [2400, 1200],
  [1536, 740],
  [1440, 670],
  [1366, 610],
  [1280, 670],
  [1030, 560],
  [900, 700],
];
const TELEFONI = [
  [412, 800],
  [390, 844],
  [384, 732],
];

const INGRESSI = ["/", "/en/"];
const PAGINE = [
  "/",
  "/en/",
  "/design/",
  "/tech/",
  "/ai/",
  "/en/design/",
  "/work/",
  "/work/digital-cv/",
  "/design-system/",
];

// Margine sotto i bottoni: la corsa della parallasse del testo.
const MARGINE = 16;

const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : undefined);
let falliti = 0;
const ok = (cond, testo, extra = "") => {
  console.log(`  ${cond ? "✅" : "❌"} ${testo}${cond || !extra ? "" : ` — ${extra}`}`);
  if (!cond) falliti++;
};

for (const [w, h] of [...DESKTOP, ...TELEFONI]) {
  // Movimento ridotto: niente parallasse né ingressi animati, quindi la
  // misura è la posizione di riposo e non un fotogramma a caso. La corsa
  // che a movimento normale si aggiunge è il MARGINE qui sopra.
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    reducedMotion: "reduce",
    isMobile: w < 900,
    hasTouch: w < 900,
  });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("go-intro-seen", "1");
    } catch {
      // storage bloccato: l'intro gira compressa, la misura non cambia
    }
  });
  const page = await ctx.newPage();
  console.log(`\n  ${w}×${h}`);

  for (const path of INGRESSI) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const ids = await page.$$eval(".lh-section[id]", (els) =>
      els.filter((el) => el.getClientRects().length).map((el) => el.id),
    );
    const tagliate = [];
    for (const id of ids) {
      // Si arriva alla scheda come ci arriva lo snap: dal suo segnaposto nel
      // flusso (lab-home-scroll.ts), non dalla scheda sticky.
      await page.evaluate((id) => {
        const s = document.getElementById(id);
        const a = s.previousElementSibling?.hasAttribute("data-lh-anchor")
          ? s.previousElementSibling
          : s;
        window.scrollTo(0, a.getBoundingClientRect().top + window.scrollY);
      }, id);
      await page.waitForTimeout(250);
      const r = await page.evaluate((id) => {
        const box = document.getElementById(id).querySelector(".lh-section__actions");
        const b = box.getBoundingClientRect();
        return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: window.innerHeight };
      }, id);
      if (r.top < 0 || r.bottom > r.h - MARGINE) tagliate.push(`${id} ${r.top}-${r.bottom}/${r.h}`);
    }
    ok(
      tagliate.length === 0,
      `${path} — i bottoni di ogni scheda stanno nella prima schermata`,
      tagliate.join(", "),
    );
  }

  if (w >= 900) {
    const sotto = [];
    for (const path of ["/work/", "/en/work/"]) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(250);
      const r = await page.evaluate(() => {
        const b = document.querySelector(".work-index-card__cta").getBoundingClientRect();
        return { bottom: Math.round(b.bottom), h: window.innerHeight };
      });
      if (r.bottom > r.h - MARGINE) sotto.push(`${path} ${r.bottom}/${r.h}`);
    }
    ok(
      sotto.length === 0,
      "/work — l'invito della prima card sta nella prima schermata",
      sotto.join(", "),
    );
  }

  const larghe = [];
  for (const path of PAGINE) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const extra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (extra > 0) larghe.push(`${path} +${extra}px`);
  }
  ok(larghe.length === 0, "nessuna pagina scorre in orizzontale", larghe.join(", "));
  await ctx.close();
}

await browser.close();
console.log(falliti ? `\n  ❌ ${falliti} verifiche fallite\n` : "\n  ✅ tutte le misure reggono\n");
process.exit(falliti ? 1 : 0);
