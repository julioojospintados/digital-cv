// scripts/qa-parity.mjs
// Le pagine italiane e inglesi devono differire per la sola lingua.
//
// Usage: npm run qa:parity        (richiede un server: QA_BASE_URL, default 4321)
//
// ── Cosa misura, e perché così ────────────────────────────────────────────
// Non confronta i testi: quelli DEVONO differire. Confronta i **conteggi**
// strutturali — quante esperienze, quante righe di cronologia, quante voci,
// quante righe di percorso, quante chip — più la lente applicata e la lingua
// dichiarata. Se una delle due lingue perde un blocco per strada, i numeri si
// scollano; se invece è solo tradotta, restano identici.
//
// Ha già trovato un difetto vero al primo giro: `data-mode` era assente su
// tutte le pagine /en/<lente>, perché lo store leggeva la lente dal primo
// segmento del path, che lì vale "en". Sintomo in produzione: colore corretto
// in SSR e pagina bianca dopo l'idratazione. Non lo vedeva nessun altro
// controllo, e a occhio si nota solo se guardi la pagina giusta.

import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4321";

// Le tre lenti, per slug: la coppia è "italiano" ↔ "lo stesso, sotto /en".
const LENTI = ["design", "tech", "ai"];
const MODE_ATTESO = { design: "creative", tech: "tech", ai: "human" };

// I conteggi che devono coincidere fra le due lingue.
const STRUTTURA = ["jobs", "all", "voci", "percorso", "chips", "sezioni"];

const browser = await chromium.launch();
let falliti = 0;
const ok = (cond, testo, extra = "") => {
  console.log(`  ${cond ? "✅" : "❌"} ${testo}${cond || !extra ? "" : ` — ${extra}`}`);
  if (!cond) falliti++;
};

async function misura(path) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errori = [];
  page.on("pageerror", (e) => errori.push(String(e)));
  // Le richieste fallite si contano dall'URL, non dal messaggio di console:
  // "Failed to load resource: 404" non dice *quale* risorsa, e senza l'URL
  // non si può distinguere un difetto vero dagli script di Vercel
  // (/_vercel/insights, /_vercel/speed-insights), che esistono solo una volta
  // deployati e in locale danno 404 su ogni pagina del sito.
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("/_vercel/")) {
      errori.push(`${r.status()} ${r.url()}`);
    }
  });
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(350);
  const r = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    mode: document.documentElement.dataset.mode ?? "",
    jobs: document.querySelectorAll(".lc-job").length,
    all: document.querySelectorAll(".lc-all__row").length,
    voci: document.querySelectorAll(".lc-voice").length,
    percorso: document.querySelectorAll(".lc-path__row").length,
    chips: document.querySelectorAll(".lc-chip").length,
    sezioni: document.querySelectorAll(".lh-section").length,
    lingua: document.querySelector(".lang-switch a")?.getAttribute("href") ?? "",
    hreflang: [...document.querySelectorAll('link[rel="alternate"]')].length,
  }));
  await page.close();
  return { ...r, status: res?.status() ?? 0, errori };
}

console.log(`\n  Parità IT ↔ EN — ${BASE}\n`);

for (const lente of LENTI) {
  const it = await misura(`/${lente}`);
  const en = await misura(`/en/${lente}`);
  console.log(`  [/${lente} ↔ /en/${lente}]`);
  ok(it.status === 200 && en.status === 200, "entrambe rispondono", `${it.status}/${en.status}`);
  ok(
    it.lang === "it" && en.lang === "en",
    "ogni pagina dichiara la propria lingua",
    `${it.lang}/${en.lang}`,
  );
  ok(
    it.mode === MODE_ATTESO[lente] && en.mode === MODE_ATTESO[lente],
    `la lente arriva a data-mode (${MODE_ATTESO[lente]})`,
    `${it.mode || "assente"}/${en.mode || "assente"}`,
  );
  const scollati = STRUTTURA.filter((k) => it[k] !== en[k]);
  ok(
    scollati.length === 0,
    "stessa struttura nelle due lingue",
    scollati.map((k) => `${k}: ${it[k]}≠${en[k]}`).join(", "),
  );
  ok(
    it.lingua === `/en/${lente}` && en.lingua === `/${lente}`,
    "lo switch porta alla stessa lente",
    `${it.lingua}/${en.lingua}`,
  );
  ok(
    it.hreflang === 3 && en.hreflang === 3,
    "hreflang it/en/x-default su entrambe",
    `${it.hreflang}/${en.hreflang}`,
  );
}

const home = await misura("/");
const homeEn = await misura("/en");
console.log("  [/ ↔ /en]");
ok(home.lang === "it" && homeEn.lang === "en", "ogni ingresso dichiara la propria lingua");
ok(
  home.sezioni === homeEn.sezioni && home.sezioni > 0,
  "stesso numero di sezioni",
  `${home.sezioni}/${homeEn.sezioni}`,
);
ok(
  home.lingua === "/en" && homeEn.lingua === "/",
  "lo switch collega i due ingressi",
  `${home.lingua}/${homeEn.lingua}`,
);

const conErrori = [home, homeEn].filter((r) => r.errori.length);
ok(
  conErrori.length === 0,
  "nessun errore in console",
  conErrori.map((r) => r.errori[0]).join(" | "),
);

await browser.close();
console.log(`\n  ${falliti === 0 ? "✅ parità verificata" : `❌ ${falliti} controlli falliti`}\n`);
process.exit(falliti === 0 ? 0 : 1);
