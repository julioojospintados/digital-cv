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
//    tastiera. Un'eccezione sola, dichiarata in STRETTI. E il tocco al
//    centro di ogni comando deve arrivare a lui: un'area allargata non può
//    finire sopra un altro comando.
// 6. Da tastiera, con il movimento normale, il Tab raggiunge i bottoni di
//    tutte e tre le schede delle lenti (IT ed EN). Fino al 2026-10-21 le
//    parole entravano con autoAlpha, cioè visibility: hidden, e il Tab le
//    saltava finché non ci si arrivava scorrendo.
// 7. Nessuna pagina scorre in orizzontale.
// 8. Ogni testo visibile di ogni pagina regge il contrasto sul fondo vero:
//    si nasconde il testo e si prende il pixel più chiaro dietro le sue
//    lettere, con la stessa soglia del punto 3. Nato il 2026-10-22: il nome
//    arancione delle card di /work stava a 2,9:1 sulla card schiarita e
//    sopra il filo della sigla, e nessun controllo lo misurava. Gira alle
//    misure in CONTRASTO, scorrendo ogni pagina dall'alto al basso: un testo
//    si misura quando è intero nella finestra e sta in cima a tutto (in una
//    pila, la scheda coperta si misura quando è lei a stare sopra).
//
// ── Su quali pagine ───────────────────────────────────────────────────────
// Tutte, lette dal build (scripts/qa-pages.mjs): regola di Giulio,
// 2026-10-22. Fino a quel giorno l'elenco era scritto qui a mano, con un
// solo case study su sei e nessuna pagina /en/work.
//
// ── Le misure ─────────────────────────────────────────────────────────────
// Prese dalle finestre desktop reali (PostHog, 2026-10-20), più i telefoni
// già usati negli altri controlli. Se i dati cambiano, si aggiornano qui:
// un controllo che non cresce col sito invecchia come una fotografia.

import { chromium } from "playwright";
import { tuttePagine } from "./qa-pages.mjs";

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
];
// Sotto il minimo (AGENTS.md § "Decisions already taken", 2026-10-21): i
// telefoni più piccoli di 360×640, come l'iPhone SE del 2016. Lì non si
// promette che le azioni stiano nella prima schermata; si controlla solo che
// niente si rompa: nessuno scorrimento laterale, contrasto, bersagli da 44px.
const MINIMI = [[320, 568]];

const INGRESSI = ["/", "/en/"];
const PAGINE = tuttePagine();

// Le misure a cui gira il contrasto di ogni testo (punto 8): il portatile
// più comune, un desktop pieno, due telefoni e il più piccolo sotto il
// minimo. Il contrasto non dipende dalla finestra, ma le sovrapposizioni sì:
// il nome di un case study passa sopra la filigrana solo su telefono.
const CONTRASTO = [
  [1366, 610],
  [1920, 1080],
  [390, 844],
  [360, 640],
  [320, 568],
];

// Comandi a cui i 44px si chiedono solo in altezza, con il perché.
const STRETTI = {
  // Le due lingue sono un interruttore a due posizioni attaccate: larghe 44
  // ciascuna, ognuna coprirebbe metà dell'altra.
  "lang-switch__opt": "altezza",
};
// Margine sotto i bottoni: la corsa della parallasse del testo.
const MARGINE = 16;

const EXECUTABLE = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const browser = await chromium.launch(EXECUTABLE ? { executablePath: EXECUTABLE } : undefined);
let falliti = 0;
const ok = (cond, testo, extra = "") => {
  console.log(`  ${cond ? "✅" : "❌"} ${testo}${cond || !extra ? "" : ` — ${extra}`}`);
  if (!cond) falliti++;
};

// ── Contrasto di ogni testo (punto 8) ──────────────────────────────────
// Si scorre la pagina dall'alto al basso. A ogni fermata si prendono le
// righe di testo intere nella finestra e in cima a tutto (il centro della
// riga appartiene al suo elemento, non a una scheda che ci sta sopra), si
// nasconde tutto il testo della pagina, si fotografa la finestra e si cerca,
// dietro ogni riga, il pixel su cui il testo ha il contrasto più basso. Ogni
// riga si misura una volta sola, alla prima fermata in cui si vede bene.
// Esclusi, come da WCAG o perché non sono testo da leggere: ciò che sta
// sotto aria-hidden (filigrane, sigle), i comandi disabilitati, il «Vai al
// contenuto» che si vede solo da tastiera, il testo trasparente.
const NASCONDI_TESTO = `*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}`;

async function contrastoTesti(page, lettore) {
  const quanti = await page.evaluate(() => {
    // Lo snap fermerebbe lo scorrimento sui segnaposto: qui serve libero.
    document.documentElement.removeAttribute("data-native-snap");
    document.documentElement.style.scrollSnapType = "none";
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgba = (col) => {
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = "#000";
      cv.fillStyle = col;
      cv.fillRect(0, 0, 1, 1);
      return [...cv.getImageData(0, 0, 1, 1).data];
    };
    const per = new Map();
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (
        !el ||
        el.closest(
          '[aria-hidden="true"], [disabled], [aria-disabled="true"], script, style, noscript, template, .skip-link',
        )
      )
        continue;
      if (!per.has(el)) per.set(el, []);
      per.get(el).push(n);
    }
    // Il testo solo per lettori di schermo (.lc-sr, .visually-hidden) è
    // ritagliato a 1×1px: c'è, ma non si vede, e non ha un contrasto da
    // reggere. Si riconosce da un riquadro di 1px che ritaglia (overflow o
    // clip-path), suo o di un antenato vicino. Un contenitore alto zero che
    // non ritaglia, come la riga del cruscotto di /work, non conta.
    const ritagliato = (el) => {
      for (let e = el, k = 0; e && k < 4; e = e.parentElement, k++) {
        const q = e.getBoundingClientRect();
        if (q.width > 1 && q.height > 1) continue;
        const cs = getComputedStyle(e);
        if (cs.overflow !== "visible" || cs.clipPath !== "none" || cs.clip !== "auto") return true;
      }
      return false;
    };
    const testi = [];
    for (const [el, nodes] of per) {
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      if (ritagliato(el)) continue;
      const cs = getComputedStyle(el);
      const c = rgba(cs.color);
      let op = 1;
      for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
      const alfa = (c[3] / 255) * op;
      if (alfa < 0.05) continue;
      const px = parseFloat(cs.fontSize);
      const grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700);
      const nome =
        [...el.classList].find((k) => !k.startsWith("astro-")) ?? el.tagName.toLowerCase();
      testi.push({
        el,
        nodes,
        rgb: c.slice(0, 3),
        alfa,
        grande,
        etichetta: `${nome} «${el.textContent.trim().replace(/\s+/g, " ").slice(0, 28)}»`,
        fatte: new Set(),
        totale: nodes.reduce((t, n) => {
          const rg = document.createRange();
          rg.selectNodeContents(n);
          return t + [...rg.getClientRects()].length;
        }, 0),
      });
    }
    window.__qaTesti = testi;
    return testi.length;
  });
  if (!quanti) return [];

  const bassi = new Map();
  for (let fermata = 0; fermata < 400; fermata++) {
    const r = await page.evaluate(async (fermata) => {
      window.scrollTo(0, fermata * Math.max(200, Math.floor(innerHeight * 0.7)));
      await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
      const righe = [];
      window.__qaTesti.forEach((t, i) => {
        // Prima il riquadro dell'elemento, che costa poco: se è fuori dalla
        // finestra, le sue righe non si guardano nemmeno. Su una pagina lunga
        // come la vetrina è la differenza fra minuti e secondi.
        if (t.fatte.size && t.fatte.size === t.totale) return;
        const b = t.el.getBoundingClientRect();
        if (b.bottom < 0 || b.top > innerHeight) return;
        let k = 0;
        for (const n of t.nodes) {
          const rg = document.createRange();
          rg.selectNodeContents(n);
          for (const q of rg.getClientRects()) {
            const id = k++;
            if (t.fatte.has(id) || q.width < 1 || q.height < 1) continue;
            if (q.top < 0 || q.left < 0 || q.bottom > innerHeight || q.right > innerWidth) continue;
            const e = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
            if (!e || !(e === t.el || t.el.contains(e) || e.contains(t.el))) continue;
            t.fatte.add(id);
            righe.push({ i, x: q.left, y: q.top, w: q.width, h: q.height });
          }
        }
      });
      const fine = window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
      return { righe, fine };
    }, fermata);

    if (r.righe.length) {
      await page.evaluate((css) => {
        const st = document.createElement("style");
        st.id = "qa-nascondi-testo";
        st.textContent = css;
        document.head.append(st);
      }, NASCONDI_TESTO);
      await page.evaluate(
        () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))),
      );
      const png = await page.screenshot();
      await page.evaluate(() => document.getElementById("qa-nascondi-testo")?.remove());
      const info = await page.evaluate(
        (ids) =>
          ids.map((i) => {
            const t = window.__qaTesti[i];
            return { rgb: t.rgb, alfa: t.alfa, grande: t.grande, etichetta: t.etichetta };
          }),
        [...new Set(r.righe.map((q) => q.i))],
      );
      const perId = new Map([...new Set(r.righe.map((q) => q.i))].map((id, k) => [id, info[k]]));
      const esiti = await lettore.evaluate(
        async ({ b64, righe, testi }) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(img, 0, 0);
          const lin = (v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          };
          const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
          const out = [];
          for (const q of righe) {
            const t = testi[q.i];
            const x0 = Math.max(0, Math.floor(q.x));
            const y0 = Math.max(0, Math.floor(q.y));
            const w = Math.min(c.width - x0, Math.ceil(q.w));
            const h = Math.min(c.height - y0, Math.ceil(q.h));
            if (w < 1 || h < 1) continue;
            const d = x.getImageData(x0, y0, w, h).data;
            let min = Infinity;
            for (let i = 0; i < d.length; i += 4) {
              // Il colore del testo, con la sua trasparenza, sopra quel pixel.
              const tr = t.rgb[0] * t.alfa + d[i] * (1 - t.alfa);
              const tg = t.rgb[1] * t.alfa + d[i + 1] * (1 - t.alfa);
              const tb = t.rgb[2] * t.alfa + d[i + 2] * (1 - t.alfa);
              const lt = lum(tr, tg, tb);
              const lb = lum(d[i], d[i + 1], d[i + 2]);
              const cr = (Math.max(lt, lb) + 0.05) / (Math.min(lt, lb) + 0.05);
              if (cr < min) min = cr;
            }
            const soglia = t.grande ? 3 : 4.5;
            if (min < soglia) out.push({ etichetta: t.etichetta, min, soglia });
          }
          return out;
        },
        { b64: png.toString("base64"), righe: r.righe, testi: Object.fromEntries(perId) },
      );
      for (const e of esiti) {
        const prima = bassi.get(e.etichetta);
        if (!prima || e.min < prima.min) bassi.set(e.etichetta, e);
      }
    }
    if (r.fine) break;
  }
  await page.evaluate(() => {
    delete window.__qaTesti;
    window.scrollTo(0, 0);
  });
  return [...bassi.values()].map((e) => `${e.etichetta} ${e.min.toFixed(2)}:1 (serve ${e.soglia})`);
}

for (const [w, h] of [...DESKTOP, ...TELEFONI, ...MINIMI]) {
  const minimo = MINIMI.some(([a, b]) => a === w && b === h);
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
  console.log(
    `\n  ${w}×${h}${minimo ? " — sotto il minimo, solo i controlli che non dipendono dallo spazio" : ""}`,
  );

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
    if (!minimo)
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
  if (!minimo)
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

  if (!minimo) {
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

  // Una visita per pagina, e in quella visita tutto quello che va misurato a
  // questa finestra: scorrimento laterale sempre, bersagli al dito sui
  // telefoni, contrasto di ogni testo alle misure in CONTRASTO.
  const telefono = w < 900;
  const contrasto = CONTRASTO.some(([a, b]) => a === w && b === h);
  const piccoli = new Set();
  const larghe = [];
  const scuri = [];
  for (const path of PAGINE) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    const extra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (extra > 0) larghe.push(`${path} +${extra}px`);

    if (telefono) {
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
          // Ritagliato a 1×1px per i lettori di schermo o per i gestori di
          // password (il campo utente nascosto di /tools/cv-recruiter): non
          // si vede e nessuno ci mette il dito.
          if (r.width <= 1 || r.height <= 1) continue;
          // Dentro un cassetto chiuso (l'indice del design system su
          // telefono) un comando ha un riquadro ma non si vede né si tocca.
          if (!e.checkVisibility({ visibilityProperty: true, opacityProperty: false })) continue;
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
          // E il tocco al centro arriva a lui, non a un'area allargata di
          // un altro comando (2026-10-21: il ::after di «Scorri», su un
          // elemento non posizionato, copriva tutto l'indice d'ingresso).
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          if (cx > 0 && cy > 0 && cx < innerWidth && cy < innerHeight) {
            const radice = e.getRootNode();
            const sopra = (radice.elementFromPoint ? radice : document).elementFromPoint(cx, cy);
            const comando = sopra?.closest(sel);
            if (sopra && comando && comando !== e && !e.contains(comando) && !comando.contains(e))
              out.push(
                `${nome} coperto da ${[...comando.classList][0] ?? comando.tagName.toLowerCase()}`,
              );
          }
        }
        return out;
      }, STRETTI);
      for (const t of trovati) piccoli.add(`${path} ${t}`);
    }

    if (contrasto) for (const t of await contrastoTesti(page, lettore)) scuri.push(`${path} ${t}`);
  }
  if (telefono)
    ok(piccoli.size === 0, "ogni comando risponde al dito su 44×44px", [...piccoli].join(", "));
  ok(larghe.length === 0, "nessuna pagina scorre in orizzontale", larghe.join(", "));
  if (contrasto)
    ok(
      scuri.length === 0,
      `ogni testo di ogni pagina regge il contrasto sul fondo vero (${PAGINE.length} pagine)`,
      scuri.slice(0, 25).join(", ") + (scuri.length > 25 ? ` … e altri ${scuri.length - 25}` : ""),
    );
  await ctx.close();
}

{
  // Movimento normale, a differenza del resto: è con le animazioni accese
  // che le parole delle schede partono trasparenti.
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 610 } });
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("go-intro-seen", "1");
    } catch {
      // storage bloccato: l'intro gira compressa, il Tab no
    }
  });
  const page = await ctx.newPage();
  console.log("\n  tastiera, movimento normale");
  for (const path of INGRESSI) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    const raggiunte = new Set();
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press("Tab");
      const id = await page.evaluate(
        () => document.activeElement?.closest(".lh-section[data-mode]")?.id ?? null,
      );
      if (id) raggiunte.add(id);
    }
    const lenti = await page.$$eval(".lh-section[data-mode]", (els) => els.map((e) => e.id));
    const mancanti = lenti.filter((id) => !raggiunte.has(id));
    ok(
      mancanti.length === 0,
      `${path} — il Tab arriva ai bottoni di ogni lente`,
      `mai raggiunte: ${mancanti.join(", ")}`,
    );
  }
  await ctx.close();
}

await browser.close();
console.log(falliti ? `\n  ❌ ${falliti} verifiche fallite\n` : "\n  ✅ tutte le misure reggono\n");
process.exit(falliti ? 1 : 0);
