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
//    bottoni (e il link al design system, dove c'è) interi dentro la
//    finestra, con 16px di margine: è la corsa della parallasse del testo
//    (lab-home-scroll.ts), che a movimento normale li sposta fino a 14px.
// 2. L'invito della prima card di /work («Leggi il Case study») sta nella
//    prima schermata, IT ed EN: stesso difetto, trovato dall'agente
//    ux-reviewer lo stesso giorno (659-692px su 610). Vale anche sui
//    telefoni: lì la card è tutta un link, ma l'invito scritto è l'unica
//    cosa che dice che si può toccare.
// 3. L'occhiello di ogni scheda (il ruolo, nel colore della lente) regge il
//    contrasto sul fondo vero, alone compreso: 3:1 se è testo grande
//    (≥ 24px, o ≥ 18,66px in grassetto), 4,5:1 altrimenti. Misura prudente:
//    si nasconde la scritta e si prende il pixel più chiaro dietro di lei.
//    L'arancione pieno passa a 3,23:1 solo perché è grande (2026-10-20): se
//    qualcuno lo rimpicciolisce o schiarisce l'alone, questo lo ferma.
// 4. Nella modale «Dicono di me» ogni testimonianza ci sta intera: sono
//    schede sticky, e una più alta dell'area che scorre si fa coprire dalla
//    successiva prima che se ne legga il fondo (1030×560, 2026-10-20).
// 5. Sui telefoni ogni comando risponde al dito su almeno 44×44px (--hit
//    in global.css): il bordo dell'elemento o, dove il disegno resta
//    piccolo, il suo ::after trasparente. Sono esclusi i link dentro una
//    frase (2.5.8 li esenta) e il «Vai al contenuto», che si vede solo da
//    tastiera. Un'eccezione sola, dichiarata in STRETTI.
// 6. Nessuna pagina principale scorre in orizzontale.
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
  // I telefoni bassi: pochi nei dati, ma sono quelli dove una scheda non sta
  // in una schermata, e l'agente ux-reviewer li misura (2026-10-20).
  [375, 667],
  [360, 640],
  [320, 568],
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

// Comandi a cui i 44px si chiedono solo in altezza, con il perché.
const STRETTI = {
  // Le due lingue sono un interruttore a due posizioni attaccate: larghe 44
  // ciascuna, ognuna coprirebbe metà dell'altra.
  "lang-switch__opt": "altezza",
};
const PAGINE_TOUCH = [
  "/",
  "/design/",
  "/work/",
  "/work/digital-cv/",
  "/design-system/",
  "/privacy/",
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
  // Una pagina vuota per leggere i pixel delle schermate: about:blank non ha
  // la CSP del sito, quindi un'immagine data: si decodifica in un canvas.
  const lettore = await ctx.newPage();
  console.log(`\n  ${w}×${h}`);

  const bassi = [];
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
        // I bottoni e, dove c'è, il link al design system che li segue
        // (scheda Web & UX): un'azione sotto il bordo è un'azione persa.
        const s = document.getElementById(id);
        const rs = [".lh-section__actions", ".lh-section__more"]
          .map((sel) => s.querySelector(sel)?.getBoundingClientRect())
          .filter((b) => b && b.height > 0);
        return {
          top: Math.round(Math.min(...rs.map((b) => b.top))),
          bottom: Math.round(Math.max(...rs.map((b) => b.bottom))),
          h: window.innerHeight,
        };
      }, id);
      if (r.top < 0 || r.bottom > r.h - MARGINE) tagliate.push(`${id} ${r.top}-${r.bottom}/${r.h}`);

      // Contrasto WCAG, misurato nella pagina vuota. L'occhiello e il paragrafo: le due scritte che passano sopra l'alone
      // della scheda e, su telefono, sopra l'oggetto in filigrana.
      for (const sel of [".lh-section__eyebrow", ".lh-section__text"]) {
        const t = await page.evaluate(
          ({ id, sel }) => {
            const e = document.getElementById(id).querySelector(sel);
            if (!e) return null;
            const cs = getComputedStyle(e);
            const c = document.createElement("canvas").getContext("2d");
            c.fillStyle = cs.color;
            c.fillRect(0, 0, 1, 1);
            const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
            const px = parseFloat(cs.fontSize);
            const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
            const q = e.getBoundingClientRect();
            e.style.setProperty("color", "transparent", "important");
            // Solo la parte nella finestra: è quella che si legge.
            const y = Math.max(0, q.top);
            const bottom = Math.min(innerHeight, q.bottom);
            return { rgb: [r, g, b], grande, x: q.left, y, w: q.width, h: bottom - y };
          },
          { id, sel },
        );
        if (!t) continue;
        if (t.w > 0 && t.h > 0) {
          const png = await page.screenshot({ clip: { x: t.x, y: t.y, width: t.w, height: t.h } });
          const peggiore = await lettore.evaluate(
            async ({ b64, rgb }) => {
              const img = new Image();
              img.src = `data:image/png;base64,${b64}`;
              await img.decode();
              const c = document.createElement("canvas");
              c.width = img.width;
              c.height = img.height;
              const x = c.getContext("2d");
              x.drawImage(img, 0, 0);
              const d = x.getImageData(0, 0, c.width, c.height).data;
              const lum = (r, g, b) => {
                const f = (v) => {
                  v /= 255;
                  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
                };
                return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
              };
              const lt = lum(...rgb);
              let min = Infinity;
              for (let i = 0; i < d.length; i += 4) {
                const lb = lum(d[i], d[i + 1], d[i + 2]);
                const cr = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
                if (cr < min) min = cr;
              }
              return min;
            },
            { b64: png.toString("base64"), rgb: t.rgb },
          );
          const soglia = t.grande ? 3 : 4.5;
          if (peggiore < soglia)
            bassi.push(`${path}${id} ${sel.slice(13)} ${peggiore.toFixed(2)}:1 (serve ${soglia})`);
        }
        await page.evaluate(
          ({ id, sel }) =>
            document.getElementById(id).querySelector(sel).style.removeProperty("color"),
          { id, sel },
        );
      }
    }
    ok(
      tagliate.length === 0,
      `${path} — i bottoni di ogni scheda stanno nella prima schermata`,
      tagliate.join(", "),
    );
  }

  const lunghe = [];
  for (const path of INGRESSI) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    // Aperta e misurata dopo un attimo: appena aperta, la modale non ha
    // ancora l'altezza finale.
    const aperta = await page.evaluate(() => {
      const d = document.getElementById("dialog-voices");
      d?.showModal();
      return Boolean(d);
    });
    if (!aperta) continue;
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const d = document.getElementById("dialog-voices");
      const s = d.querySelector(".memory-dialog__scroll");
      // Solo le schede impilate: dove la pila è spenta (telefoni bassi,
      // memory-drawer.css) scorrono come un elenco e non devono starci.
      const cards = [...d.querySelectorAll(".about-voices__card")].filter(
        (c) => getComputedStyle(c).position === "sticky",
      );
      if (!cards.length) {
        d.close();
        return { serve: 0, area: 0 };
      }
      const serve = Math.max(
        ...cards.map((c) => c.getBoundingClientRect().height + parseFloat(getComputedStyle(c).top)),
      );
      const area = s.clientHeight;
      d.close();
      return { serve: Math.round(serve), area };
    });
    if (r.serve > r.area) lunghe.push(`${path} ${r.serve}/${r.area}`);
  }
  ok(
    lunghe.length === 0,
    "«Dicono di me»: ogni testimonianza sta intera nella modale",
    lunghe.join(", "),
  );

  ok(
    bassi.length === 0,
    "occhiello e testo di ogni scheda reggono il contrasto sul fondo vero",
    bassi.join(", "),
  );

  {
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

  if (w < 900) {
    const piccoli = new Set();
    for (const path of PAGINE_TOUCH) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const trovati = await page.evaluate((STRETTI) => {
        const out = [];
        const sel = "a[href], button, summary, [role=button], input, select";
        const tutti = [];
        const giu = (root) => {
          tutti.push(...root.querySelectorAll(sel));
          for (const h of root.querySelectorAll("*")) if (h.shadowRoot) giu(h.shadowRoot);
        };
        giu(document);
        for (const e of tutti) {
          const r = e.getBoundingClientRect();
          if (!r.width || !r.height || r.bottom <= 0) continue;
          if (e.classList.contains("skip-link")) continue;
          const cs = getComputedStyle(e);
          if (cs.display === "inline" && e.closest("p, li")) continue;
          let w = r.width;
          let h = r.height;
          const a = getComputedStyle(e, "::after");
          if (a.content !== "none" && a.position === "absolute") {
            w = Math.max(w, parseFloat(a.width) || 0);
            h = Math.max(h, parseFloat(a.height) || 0);
          }
          // Un comando dentro uno shadow root conta con l'area del suo ospite
          // (il GO: il <button> sta dentro <go-logo>, dentro un link).
          const host = e.getRootNode().host;
          if (host) {
            const ospite = host.closest("a, button");
            if (ospite) {
              const ha = getComputedStyle(ospite, "::after");
              w = Math.max(w, parseFloat(ha.width) || 0);
              h = Math.max(h, parseFloat(ha.height) || 0);
            }
          }
          const nome =
            [...e.classList].find((c) => !c.startsWith("astro-")) ?? e.tagName.toLowerCase();
          const soloAltezza = STRETTI[nome] === "altezza";
          if (h < 43.5 || (!soloAltezza && w < 43.5))
            out.push(`${nome} ${Math.round(w)}×${Math.round(h)}`);
        }
        return out;
      }, STRETTI);
      for (const t of trovati) piccoli.add(`${path} ${t}`);
    }
    ok(piccoli.size === 0, "ogni comando risponde al dito su 44×44px", [...piccoli].join(", "));
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
