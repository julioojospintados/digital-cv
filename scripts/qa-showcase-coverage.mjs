// scripts/qa-showcase-coverage.mjs
// Ogni componente vivo dev'essere in vetrina. Questo lo dimostra.
//
// Usage: npm run qa:showcase        (lo chiama scripts/qa-prepush.mjs)
// Prerequisito: cv-site/dist/client — cioè una build fatta.
//
// ── Perché esiste ─────────────────────────────────────────────────────────
// AGENTS.md ha una regola: un componente nuovo o modificato va creato o
// aggiornato anche in /design-system, nello stesso lavoro. È una buona regola
// e per mesi non è stata rispettata — non per cattiva volontà, ma perché
// nessuno poteva accorgersene. Ad agosto 2026 il conto era di 91 classi vive
// che la vetrina non nominava: la cronologia a barre, il percorso, le voci, i
// contatti dell'ingresso, i cassetti, la lightbox, il viaggio di /work, il
// cursore, il FAB. Otto push l'avevano lasciata indietro un pezzo per volta.
//
// Una regola che nessuno può verificare non è una regola: è un'intenzione.
// Questo file la rende una condizione del push.
//
// ── Come ──────────────────────────────────────────────────────────────────
// Estrae ogni `class` dall'HTML **costruito** delle pagine pubbliche — il sito
// vero, non i sorgenti — e cerca ciascun nome, con i confini di parola, dentro
// la /design-system costruita. Quello che non compare da nessuna parte è un
// componente che esiste e che nessuno ha documentato.
//
// Nessun browser: legge dei file e cerca delle stringhe. Costa un secondo.
//
// ── Il confine ────────────────────────────────────────────────────────────
// Dice che un nome NON è nominato. Non dice che sia documentato *bene*: una
// classe citata in una scheda sbagliata passa questo controllo. Quella metà
// del lavoro resta di chi legge il diff — vedi
// .claude/skills/verification-loop/SKILL.md.

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "cv-site/dist/client");
// La vetrina COSTRUITA, non il sorgente. Due componenti (EntryFooter,
// WorkIndexCard) la vetrina li importa davvero invece di ricopiarne il
// markup: le loro classi non compaiono in DesignSystem.astro e cercarle lì
// le darebbe per non documentate proprio perché sono documentate meglio
// delle altre. Nell'HTML reso ci sono, insieme alle schede di specifica.
const VETRINA = join(DIST, "design-system/index.html");

// Le pagine che la vetrina dichiara di coprire, in testa a DesignSystem.astro:
// l'ingresso (lh-*), le tre lenti (lc-*) e /work (work-*). Una lingua sola:
// le classi non cambiano con la lingua, e la parità IT/EN la verifica qa:ds.
const PAGINE = [
  "index.html",
  "design/index.html",
  "tech/index.html",
  "ai/index.html",
  "work/index.html",
];

// Fuori perimetro, e ognuna con la sua ragione scritta. Questa lista è il
// posto dove si mente a sé stessi: aggiungere una voce dev'essere una
// decisione dichiarata, non un modo per far tacere il controllo.
const FUORI = [
  {
    test: (c) => c.startsWith("astro-"),
    perche: "Generate da Astro per lo scoping degli stili, non nostre.",
  },
];

// Nota storica, e volutamente NON un'esclusione. Fino al 2026-08-26 questo
// elenco conteneva anche gli 86 `ds__*` di WorkDesignSystem.astro, la
// sezione "Design System" dentro il case study digital-cv. Quella sezione e'
// stata sospesa perche' documentava il sistema precedente — quattro lenti
// invece di tre, gli square con glow delle skill che non esistono piu' — e
// con lei sono spariti anche i suoi ds__*.
//
// La riga d'esclusione e' stata tolta apposta: se un giorno qualcuno
// riattiva quella sezione senza prima aggiornarla, questo controllo fallisce
// con ottantasei nomi in elenco. E' il promemoria migliore che potesse
// avere, e non costa niente tenerlo.

// Le pagine di /work sono tante quante i case study: le scopre da sé, così
// un progetto nuovo entra nel controllo senza che nessuno se ne ricordi.
async function paginePubbliche() {
  const elenco = [...PAGINE];
  const dir = join(DIST, "work");
  for (const voce of await readdir(dir, { withFileTypes: true })) {
    if (voce.isDirectory()) elenco.push(`work/${voce.name}/index.html`);
  }
  return elenco;
}

function classiDi(html) {
  const fuori = new Set();
  for (const attr of html.matchAll(/class="([^"]*)"/g)) {
    for (const c of attr[1].split(/\s+/)) if (c) fuori.add(c);
  }
  return fuori;
}

if (!existsSync(DIST)) {
  console.error("\n  ❌ cv-site/dist/client non esiste: serve una build.\n");
  process.exit(1);
}

const vetrina = await readFile(VETRINA, "utf8");
const nominata = (c) =>
  new RegExp(`(?<![A-Za-z0-9_-])${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_-])`).test(
    vetrina,
  );

const pagine = await paginePubbliche();
const vive = new Map(); // classe → prima pagina in cui compare

for (const rel of pagine) {
  const html = await readFile(join(DIST, rel), "utf8");
  for (const c of classiDi(html)) if (!vive.has(c)) vive.set(c, rel);
}

const escluse = [];
const mancanti = [];
for (const [classe, dove] of vive) {
  const regola = FUORI.find((r) => r.test(classe));
  if (regola) {
    escluse.push(classe);
    continue;
  }
  if (!nominata(classe)) mancanti.push({ classe, dove });
}

const coperte = vive.size - escluse.length - mancanti.length;
const perimetro = vive.size - escluse.length;

console.log(`\n  Vetrina — ${pagine.length} pagine, ${perimetro} classi nel perimetro\n`);

if (mancanti.length === 0) {
  console.log(`  ✅ ogni componente vivo è nominato in /design-system (${coperte}/${perimetro})`);
  if (escluse.length) console.log(`  ·  ${escluse.length} classi fuori perimetro, per iscritto`);
  console.log("");
  process.exit(0);
}

console.error(`  ❌ ${mancanti.length} classi vive che /design-system non nomina:\n`);

// Raggruppate per famiglia: un componente nuovo arriva con dieci classi, e
// dieci righe separate fanno sembrare enorme un lavoro che è un pannello.
const famiglie = new Map();
for (const { classe, dove } of mancanti) {
  const fam = classe.split(/__|--/)[0];
  if (!famiglie.has(fam)) famiglie.set(fam, { dove, classi: [] });
  famiglie.get(fam).classi.push(classe);
}
for (const [fam, { dove, classi }] of famiglie) {
  console.error(`     ${fam}  (${classi.length})  →  /${dove.replace("/index.html", "")}`);
  console.error(`        ${classi.join(" · ")}`);
}

console.error(`
  La regola sta in AGENTS.md § "Ogni componente sta in vetrina": un componente
  nuovo o modificato si crea o si aggiorna anche in
  cv-site/src/components/DesignSystem.astro, nello stesso lavoro — pannello,
  scheda di specifica e voce d'indice.

  Se una di queste classi non è davvero un componente, non toglierla dal
  controllo di nascosto: aggiungila a FUORI in questo file, con scritto
  perché. Una riga in più qui è una decisione; un controllo spento non lo è.
`);

process.exit(1);
