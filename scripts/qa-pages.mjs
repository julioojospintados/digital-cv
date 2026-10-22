// scripts/qa-pages.mjs
// L'elenco delle pagine su cui girano i controlli, letto dal build.
//
// Regola di Giulio, 2026-10-22: ogni controllo gira su TUTTE le pagine. Fino a
// quel giorno ogni script aveva il suo elenco scritto a mano, e gli elenchi
// invecchiavano: qa:viewports guardava un solo case study su sei e nessuna
// pagina /en/work, e tre difetti di contrasto sui case study nuovi sono
// passati il pre-push. Un elenco scritto a mano è una fotografia; questo si
// rifà a ogni build, e una pagina nuova entra nei controlli senza che nessuno
// se ne ricordi.
//
// Le pagine si scoprono dai file HTML di cv-site/dist/client: ogni
// `x/index.html` è `/x/`, e `404.html` è `/404`. Chi le chiama decide cosa
// farne (una pagina privata non ha la gemella inglese, la 404 è una sola),
// ma parte sempre da qui.

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const DIST = join(ROOT, "cv-site/dist/client");

/** Strumenti privati: non linkati, noindex, protetti da passphrase. */
export const PRIVATE_PREFIX = "/tools/";

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith(".html")) yield p;
  }
}

/** Ogni pagina del build come percorso URL, in ordine stabile. */
export function tuttePagine() {
  if (!existsSync(DIST)) throw new Error("cv-site/dist/client non esiste: serve una build.");
  const out = [];
  for (const file of walk(DIST)) {
    const rel = relative(DIST, file).split(sep).join("/");
    if (rel === "index.html") out.push("/");
    else if (rel.endsWith("/index.html")) out.push(`/${rel.slice(0, -"index.html".length)}`);
    else out.push(`/${rel.replace(/\.html$/, "")}`);
  }
  return out.sort();
}

/** Il file HTML costruito di un percorso. */
export function fileDi(path) {
  if (path === "/") return join(DIST, "index.html");
  if (path.endsWith("/")) return join(DIST, path, "index.html");
  return join(DIST, `${path}.html`);
}

/** La stessa pagina nell'altra lingua, o null se è italiana e non esiste. */
export function gemella(path) {
  if (path === "/en/") return "/";
  if (path.startsWith("/en/")) return path.slice(3);
  return path === "/" ? "/en/" : `/en${path}`;
}

/**
 * Le coppie IT ↔ EN che esistono tutte e due. La 404 e gli strumenti privati
 * non hanno gemella per costruzione (qa:links dice quali pagine devono
 * averla): restano fuori dalle coppie, non dagli altri controlli.
 */
export function coppie(pagine = tuttePagine()) {
  const set = new Set(pagine);
  return pagine
    .filter((p) => !p.startsWith("/en/") && set.has(gemella(p)))
    .map((p) => [p, gemella(p)]);
}
