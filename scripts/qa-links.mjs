// scripts/qa-links.mjs
// Nessun link interno rotto, e nessuna coppia IT/EN scompagnata.
//
// Usage: npm run qa:links          (richiede una build: cv-site/dist/client)
//
// ── Perché esiste ─────────────────────────────────────────────────────────
// Il sito ha due alberi di pagine e cinque redirect legacy. Un link scritto a
// mano che punta a una rotta spostata non rompe la build, non rompe i test e
// non si vede finché qualcuno non ci clicca. È già successo: dopo aver dato
// una lente nel path anche all'inglese, `/en/cv` è rimasto linkato da 404,
// dalla privacy EN e da tutte le pagine work EN — cinque link morti su un
// sito che builda pulito.
//
// Non serve un browser: si legge l'HTML generato.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "cv-site/dist/client");

// Indirizzi storici serviti come 301 dall'adapter (astro.config.mjs): non
// esistono come file e non devono risultare rotti. Vanno tenuti allineati a
// mano con quel blocco — sono cinque righe, e questo commento è il promemoria.
const REDIRECTS = new Set(["/home", "/cv", "/creative", "/human", "/en/cv"]);

if (!existsSync(DIST)) {
  console.error("\n  Manca cv-site/dist/client — lancia prima `astro build`.\n");
  process.exit(1);
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith(".html")) yield p;
  }
}

const risolve = (href) => {
  const pulito = href.split("#")[0].split("?")[0];
  if (REDIRECTS.has(pulito.replace(/\/$/, ""))) return true;
  const rel = pulito.replace(/^\/+|\/+$/g, "");
  return [join(DIST, rel), join(DIST, rel, "index.html"), join(DIST, `${rel}.html`)].some((c) =>
    existsSync(c),
  );
};

const pagine = [...walk(DIST)];
const rotti = new Map();
const senzaControparte = [];

for (const file of pagine) {
  const url =
    "/" +
    relative(DIST, file)
      .replace(/\\/g, "/")
      .replace(/(index)?\.html$/, "");
  const html = readFileSync(file, "utf8");

  for (const m of html.matchAll(/href="(\/[^"#][^"]*)"/g)) {
    const href = m[1];
    // `//esterno.com` e gli asset con hash di Astro non sono rotte.
    if (href.startsWith("//") || href.startsWith("/_")) continue;
    if (risolve(href)) continue;
    if (!rotti.has(href)) rotti.set(href, new Set());
    rotti.get(href).add(url);
  }

  // Parità di esistenza: ogni pagina pubblica italiana deve avere la sua
  // gemella inglese, e viceversa. Non guarda il contenuto — quello lo fa
  // qa-parity.mjs — solo che il file dall'altra parte ci sia.
  const fuori = ["/lab/", "/old-version/", "/tools/", "/404", "/prototype/"];
  if (fuori.some((p) => url.startsWith(p))) continue;
  const gemella =
    url.startsWith("/en/") || url === "/en/"
      ? url.replace("/en", "") || "/"
      : `/en${url === "/" ? "/" : url}`;
  if (!risolve(gemella)) senzaControparte.push(`${url}  →  manca ${gemella}`);
}

console.log(`\n  Link interni — ${pagine.length} pagine analizzate\n`);

let uscita = 0;
if (rotti.size === 0) {
  console.log("  ✅ nessun link interno rotto");
} else {
  uscita = 1;
  for (const [href, dove] of [...rotti].sort()) {
    console.log(`  ❌ ${href}`);
    console.log(`       linkato da: ${[...dove].sort().slice(0, 5).join(", ")}`);
  }
}

if (senzaControparte.length === 0) {
  console.log("  ✅ ogni pagina pubblica ha la sua controparte nell'altra lingua");
} else {
  uscita = 1;
  console.log("\n  ❌ pagine senza controparte:");
  for (const r of senzaControparte.sort()) console.log(`       ${r}`);
}

console.log("");
process.exit(uscita);
