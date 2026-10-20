// scripts/qa-units.mjs
// Nessun px fuori dai bordi: la regola delle unità, resa verificabile.
//
// Usage: node scripts/qa-units.mjs        (o: npm run qa:units)
// Non serve un browser: è un controllo sul sorgente, e gira in un secondo.
//
// ── La regola ─────────────────────────────────────────────────────────────
// Ogni misura sta in rem, ancorata a un root di 16px. Restano in px solo 1, 2
// e 3: sono spessori di bordo e ombre da un pixel, cioè pixel di dispositivo,
// non misure tipografiche — un bordo che cresce con il testo diventa una
// barra. Tutto il resto in px è una misura che a 200% di zoom non cresce
// insieme al testo che accompagna, e lì il layout si rompe.
//
// ── Gli spessori hanno un nome (2026-10-20) ──────────────────────────────
// Dentro le proprietà che disegnano un filo — bordi, anello di fuoco, contorno
// delle sigle, distanza della sottolineatura — anche 1, 2 e 3px vanno scritti
// con le variabili di global.css (--line-1/2/3, --focus-ring,
// --focus-offset), non a mano: è la sola cosa che permette di cambiare lo
// spessore dell'anello di fuoco con una riga. Il valore di riserva dentro
// var() (`var(--line-1, 1px)`, nei componenti Lit) è ammesso.
// Restano px letterali, di proposito, i movimenti (translate), le ombre di
// profondità e il ritaglio 1×1 dei testi solo per screen reader.
//
// ── Cosa NON viene guardato ──────────────────────────────────────────────
// I commenti: «era alto 18px», «il webp è 177px» sono documentazione di
// misure reali e devono restare in px, o smettono di dire cosa è successo.
// Nei sorgenti .astro e .ts, solo i blocchi <style>, i css`` di Lit e gli
// attributi style: un «257px» dentro una frase è prosa, non CSS.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath e non .pathname: su Windows quest'ultimo restituisce
// "/C:/Users/..." e il join successivo produce "C:\C:\Users\...", che non
// esiste — lo script moriva con ENOENT prima di guardare un solo file.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "cv-site/src");

// Nessuna eccezione. La regola vale anche sui fogli delle pagine sospese: il
// giorno in cui una torna attiva non deve portarsi dietro una conversione
// arretrata, e una lista di esenzioni è il posto in cui le regole vanno a
// morire.
const SKIP = new Set();
const ALLOWED = new Set([1, 2, 3]);

const blank = (m) => m.replace(/[^\n]/g, " ");
const maskComments = (s) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/^[ \t]*\/\/.*$/gm, blank);

/** Nei sorgenti, tiene solo ciò che è davvero CSS. */
function cssOnly(src) {
  let out = blank(src);
  const keep = (rx) => {
    for (const m of src.matchAll(rx)) {
      out = out.slice(0, m.index) + m[0] + out.slice(m.index + m[0].length);
    }
  };
  keep(/<style[^>]*>[\s\S]*?<\/style>/g);
  keep(/\bcss`[\s\S]*?`/g);
  keep(/style="[^"]*"/g);
  keep(/style=\{`[^`]*`\}/g);
  return out;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const offenders = [];
const unnamed = [];
let scanned = 0;

// Le proprietà che disegnano un filo: lì lo spessore passa dalle variabili.
const LINE_DECL =
  /(?<![\w-])(border(?:-(?:top|right|bottom|left))?(?:-width)?|outline(?:-offset)?|-webkit-text-stroke|text-underline-offset|text-decoration-thickness)\s*:([^;{}]*)/g;

for (const file of walk(SRC)) {
  const name = basename(file);
  if (SKIP.has(name)) continue;
  const isCss = file.endsWith(".css");
  const isSrc = file.endsWith(".astro") || file.endsWith(".ts");
  if (!isCss && !isSrc) continue;

  const src = readFileSync(file, "utf8");
  const hay = maskComments(isCss ? src : cssOnly(src));
  scanned++;

  for (const m of hay.matchAll(/(-?\d*\.?\d+)px\b/g)) {
    const v = Math.abs(Number(m[1]));
    if (v === 0 || ALLOWED.has(v)) continue;
    const line = hay.slice(0, m.index).split("\n").length;
    offenders.push(`${relative(ROOT, file)}:${line}  ${m[0]}  →  ${Number(m[1]) / 16}rem`);
  }

  for (const d of hay.matchAll(LINE_DECL)) {
    // Un px preceduto da «, » è il valore di riserva di un var(): ammesso.
    for (const m of d[2].matchAll(/(?<!,\s?)(?<![\w.-])([123])px\b/g)) {
      const at = d.index + d[0].indexOf(d[2]) + m.index;
      const line = hay.slice(0, at).split("\n").length;
      unnamed.push(`${relative(ROOT, file)}:${line}  ${d[1]}: …${m[0]}…  →  var(--line-${m[1]})`);
    }
  }
}

console.log(`\n  Unità — ${scanned} file esaminati\n`);
if (unnamed.length === 0) {
  console.log("  ✅ ogni spessore di bordo e di anello passa dalle variabili");
} else {
  console.error(`  ❌ ${unnamed.length} spessori scritti a mano invece che con le variabili:\n`);
  for (const o of unnamed) console.error(`     ${o}`);
  console.error("");
  process.exitCode = 1;
}
if (offenders.length === 0) {
  console.log("  ✅ nessun px fuori da 1, 2 e 3\n");
} else {
  console.error(`  ❌ ${offenders.length} misure in px da convertire in rem:\n`);
  for (const o of offenders) console.error(`     ${o}`);
  console.error("");
  process.exitCode = 1;
}
