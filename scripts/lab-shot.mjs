// Screenshot del prototipo /lab/hero — usa il Chromium già installato dal
// pacchetto playwright della root. Temporaneo, serve solo a verificare il
// banco di prova: si cancella insieme a /lab quando la direzione è decisa.
import { chromium } from "playwright";

const BASE = process.env.LAB_BASE ?? "http://localhost:4333";
const OUT = process.env.LAB_OUT ?? ".playwright-mcp";

const shots = [
  { name: "lab-desktop", w: 1440, h: 900, full: false },
  { name: "lab-desktop-full", w: 1440, h: 900, full: true },
  { name: "lab-mobile", w: 390, h: 844, full: false },
];

const browser = await chromium.launch();
const errors = [];

for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  page.on("pageerror", (e) => errors.push(`${s.name}: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${s.name}: ${m.text()}`);
  });

  await page.goto(`${BASE}/lab/hero`, { waitUntil: "networkidle" });
  // Puntatore al centro-destra: mette la parallasse in una posizione non neutra,
  // così lo screenshot mostra la profondità invece dello stato a riposo.
  await page.mouse.move(s.w * 0.72, s.h * 0.38);
  await page.waitForTimeout(900);

  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });

  const metrics = await page.evaluate(() => ({
    height: document.body.scrollHeight,
    screens: +(document.body.scrollHeight / window.innerHeight).toFixed(1),
  }));
  console.log(`${s.name}: ${metrics.height}px — ${metrics.screens} schermate`);
  await page.close();
}

await browser.close();

if (errors.length) {
  console.log("\nERRORI:");
  for (const e of errors) console.log(" - " + e);
  process.exitCode = 1;
} else {
  console.log("\nnessun errore di console");
}
