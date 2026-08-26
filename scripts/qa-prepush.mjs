// scripts/qa-prepush.mjs
// I controlli che girano con un browser, orchestrati per il pre-push.
//
// Usage: npm run qa:prepush        (lo chiama .husky/pre-push, vedi AGENTS.md)
//
// ── Perché qui e non a ogni modifica ──────────────────────────────────────
// `qa:ds` e `qa:parity` aprono Chromium e chiedono un server: sono i due
// controlli che costano davvero. Girarli a ogni salvataggio è tempo buttato;
// non girarli mai è come non averli scritti. Il punto giusto è **prima del
// push**: è l'ultimo momento in cui il difetto è ancora solo tuo, ed è raro
// abbastanza da poter costare un minuto.
//
// Regola di progetto (decisione di Giulio, 2026-08-20): `qa:ds` si esegue
// SOLO qui. Durante il lavoro bastano lint, format, test, qa:units e la build.
//
// ── Cosa fa ───────────────────────────────────────────────────────────────
// Costruisce il sito, serve `dist/client` su una porta libera come farebbe un
// hosting statico, lancia i due controlli e smonta tutto. Nessun dev server da
// ricordarsi di avviare, e — non secondario — si verifica la build **vera**,
// non la pagina servita da Vite: la cache delle dipendenze di un dev server
// rimasto aperto ha già prodotto falsi negativi in passato.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = join(ROOT, "cv-site");
const DIST = join(SITE, "dist/client");
const PORT = Number(process.env.QA_PORT ?? 4399);

const TIPI = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
};

const run = (cmd, args, opts = {}) =>
  new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });
    p.on("close", (code) => resolve(code ?? 1));
  });

// ── 1. Build ──────────────────────────────────────────────────────────────
if (process.env.QA_SKIP_BUILD !== "1") {
  console.log("\n  Build del sito…\n");
  const code = await run("npx", ["astro", "build"], { cwd: SITE });
  if (code !== 0) {
    console.error("\n  ❌ la build è fallita: i controlli non possono girare.\n");
    process.exit(code);
  }
} else if (!existsSync(DIST)) {
  console.error("\n  ❌ QA_SKIP_BUILD=1 ma dist/client non esiste.\n");
  process.exit(1);
}

// ── 2. Server statico sull'output reale ───────────────────────────────────
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const rel = normalize(url).replace(/^([/\\])+/, "");
  for (const file of [join(DIST, rel), join(DIST, rel, "index.html"), join(DIST, `${rel}.html`)]) {
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TIPI[extname(file)] ?? "application/octet-stream" });
      res.end(body);
      return;
    } catch {
      /* prova il candidato successivo */
    }
  }
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("404");
});

// Porta 0 = la sceglie il sistema fra quelle libere, e bind esplicito su
// 127.0.0.1. Non è pignoleria: con una porta fissa, un processo rimasto
// appeso da una sessione precedente se la prende, e su Windows può tenerla
// **solo su ::1** — il nostro server parte lo stesso su IPv4 senza errore,
// ma `localhost` risolve prima l'IPv6 e i controlli finiscono sul server
// sbagliato. Sintomo: 404 ovunque su un sito che è stato appena costruito
// bene. Costato mezz'ora una volta; con la porta effimera non può ripetersi.
await new Promise((r) => server.listen(process.env.QA_PORT ? PORT : 0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}`;

// Autoverifica: se il server non risponde, i controlli qui sotto darebbero
// una schermata di 404 che sembra un difetto del sito e non lo è. Meglio
// fallire subito, dicendo dov'è il problema.
{
  const res = await fetch(`${BASE}/`).catch(() => null);
  if (!res || !res.ok) {
    console.error(`\n  ❌ ${BASE} non risponde (${res ? res.status : "nessuna risposta"}).`);
    console.error("     Porta occupata? Riprova con QA_PORT=<altra porta>.\n");
    server.close();
    process.exit(1);
  }
  console.log(`\n  Sito servito su ${BASE}`);
}

// ── 3. I controlli ────────────────────────────────────────────────────────
// qa-showcase-coverage non chiede il server (legge i file costruiti), ma gira
// qui perché la build è già fatta e perché il push è il punto in cui la regola
// «ogni componente sta in vetrina» diventa una condizione invece di un
// proposito.
const env = { ...process.env, QA_BASE_URL: BASE };
let esito = 0;
for (const [nome, script] of [
  ["vetrina (qa:ds)", "scripts/qa-design-system.mjs"],
  ["copertura della vetrina", "scripts/qa-showcase-coverage.mjs"],
  ["parità IT ↔ EN", "scripts/qa-parity.mjs"],
  ["link interni", "scripts/qa-links.mjs"],
]) {
  console.log(`\n  ── ${nome} ──`);
  const code = await run("node", [join(ROOT, script)], { cwd: ROOT, env });
  if (code !== 0) esito = code;
}

server.close();
console.log(
  esito === 0 ? "\n  ✅ tutti i controlli da browser sono passati\n" : "\n  ❌ push interrotto\n",
);
process.exit(esito);
