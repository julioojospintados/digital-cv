// Prova di /lab/home su telefono: dimensioni degli oggetti e scorrimento
// **a dito**, non a rotella. Sono due percorsi di codice diversi in
// lab-home-scroll.ts (wheel vs touchstart/touchmove) e finora era stato
// esercitato solo il primo.
import { chromium, devices } from "playwright";

const browser = await chromium.launch({ args: ["--disable-gpu", "--disable-dev-shm-usage"] });
const ctx = await browser.newContext({
  ...devices["iPhone 13"], // hasTouch: true, isMobile: true
});
const page = await ctx.newPage();
page.setDefaultTimeout(90000);
await page.goto("http://localhost:4333/lab/home", { waitUntil: "load", timeout: 90000 });
await page.waitForTimeout(2500);

const vp = page.viewportSize();
console.log(`viewport ${vp.width}x${vp.height} (touch emulato)\n`);

// ── 1. Dimensioni reali degli oggetti nella griglia ──
const objs = await page.evaluate(() => {
  const stage = document.querySelector(".lh-stage").getBoundingClientRect();
  return {
    stage: { w: Math.round(stage.width), h: Math.round(stage.height) },
    items: [...document.querySelectorAll(".lh-obj")].map((o) => {
      const img = o.querySelector(".lh-obj__img").getBoundingClientRect();
      return {
        name: o.dataset.obj,
        w: Math.round(img.width),
        h: Math.round(img.height),
        pctW: Math.round((img.width / stage.width) * 100),
      };
    }),
  };
});
console.log(`griglia oggetti: ${objs.stage.w}x${objs.stage.h}px`);
for (const i of objs.items.sort((a, b) => b.w - a.w))
  console.log(
    `   ${i.name.padEnd(11)} ${String(i.w).padStart(3)}x${String(i.h).padStart(3)}px  (${i.pctW}% della larghezza)`,
  );

// ── 2. Altezze dei pannelli ──
const geo = await page.evaluate(() => ({
  hero: Math.round(document.querySelector(".lh-hero").getBoundingClientRect().height),
  vh: window.innerHeight,
  secs: [...document.querySelectorAll(".lh-section")].map((s) => {
    const cta = s.querySelector(".lh-cta");
    return {
      m: s.dataset.mode,
      h: Math.round(s.getBoundingClientRect().height),
      inside: cta.getBoundingClientRect().bottom <= s.getBoundingClientRect().bottom + 1,
    };
  }),
  hScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
}));
console.log(
  `\nhero ${geo.hero}px / finestra ${geo.vh}px  ${geo.hero <= geo.vh + 2 ? "OK" : "SFORA"}`,
);
for (const s of geo.secs)
  console.log(`   ${s.m.padEnd(11)} ${s.h}px  bottone ${s.inside ? "dentro" : "FUORI"}`);
console.log(`scroll orizzontale: ${geo.hScroll ? "SI" : "no"}`);

// ── 3. Scorrimento a dito ──
const swipe = async (dy) => {
  const x = vp.width / 2;
  const from = dy > 0 ? vp.height * 0.72 : vp.height * 0.28;
  await page.touchscreen.tap(x, from); // assicura il touchstart
  await page.evaluate(
    ([x, from, dy]) => {
      const t = (cy) =>
        new Touch({ identifier: 1, target: document.body, clientX: x, clientY: cy });
      const ev = (type, cy) =>
        document.body.dispatchEvent(
          new TouchEvent(type, {
            touches: type === "touchend" ? [] : [t(cy)],
            changedTouches: [t(cy)],
            bubbles: true,
            cancelable: true,
          }),
        );
      ev("touchstart", from);
      for (let s = 1; s <= 6; s++) ev("touchmove", from - (dy * s) / 6);
      ev("touchend", from - dy);
    },
    [x, from, dy],
  );
  await page.waitForTimeout(1600);
  return page.evaluate(() => Math.round(window.scrollY));
};

console.log("\nscorrimento a dito (uno swipe = una scheda?)");
let prev = await page.evaluate(() => Math.round(window.scrollY));
console.log(`   partenza          y=${prev}`);
for (let i = 1; i <= 4; i++) {
  const y = await swipe(260);
  const step = y - prev;
  const expected = geo.vh;
  const label =
    step === 0
      ? "FERMO"
      : Math.abs(step - expected) < 40
        ? "una scheda"
        : `${step}px — NON una scheda`;
  console.log(`   swipe giù #${i}      y=${String(y).padStart(4)}  (+${step})  ${label}`);
  prev = y;
}
const back = await swipe(-260);
console.log(
  `   swipe su          y=${String(back).padStart(4)}  (${back - prev})  ${back < prev ? "torna indietro" : "NON torna"}`,
);

// ── 4. La luce d'ambiente segue la scheda? ──
const mood = await page.evaluate(() => document.querySelector(".lh").dataset.mood ?? "(nessuno)");
console.log(`\nambiente attivo dopo gli swipe: ${mood}`);

await browser.close();
