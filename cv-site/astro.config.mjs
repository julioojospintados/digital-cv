// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import lit from "@astrojs/lit";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

import { stripHtmlComments } from "./src/lib/strip-html-comments.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @param {string} dir @returns {Promise<string[]>} */
async function walkHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkHtmlFiles(full)));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

// L'implementazione vive in src/lib/strip-html-comments.js, con la suite di
// test accanto: stava qui dentro come coppia di regex e in quella forma aveva
// già cancellato in silenzio parte di una pagina (vedi il commento nel modulo).
// Estrarla la rende verificabile — un bug di questo tipo non si nota a occhio
// sull'HTML compresso, lo si vede solo con un test che lo riproduce.
function stripComments() {
  return {
    name: "strip-html-comments",
    hooks: {
      "astro:build:done": async (/** @type {{ dir: URL }} */ { dir }) => {
        const outDir = fileURLToPath(dir);
        const files = await walkHtmlFiles(outDir);
        await Promise.all(
          files.map(async (/** @type {string} */ file) => {
            const html = await readFile(file, "utf-8");
            await writeFile(file, stripHtmlComments(html), "utf-8");
          }),
        );
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://giulio-occhipinti.com",
  // Comprime spazi/newline ridondanti in output — i commenti li rimuove
  // stripComments() sotto, in un hook post-build separato.
  compressHTML: true,
  // Il sito resta statico (prerendered) di default: solo le route con
  // `export const prerender = false` (oggi le 3 API del tool privato in
  // src/pages/api/cv-recruiter*.ts) diventano funzioni serverless Vercel.
  // Aggiunto per il tool privato /tools/cv-recruiter — vedi AGENTS.md.
  output: "static",

  /**
   * Indirizzi storici → indirizzi attuali. Dichiarati qui e non come pagine
   * `Astro.redirect`: con l'adapter Vercel diventano redirect di rete 301,
   * mentre una pagina produce un HTML con `<meta http-equiv="refresh">`, che
   * costa un caricamento in più a chi arriva e finisce dentro sitemap.xml
   * come URL da scansionare.
   *
   * 301 e non 302 perché i nuovi indirizzi sono definitivi: il permanente è
   * ciò che trasferisce al nuovo URL la reputazione accumulata dal vecchio.
   *
   * /cv e /en/cv puntano alla lente di default (Design-first, DEFAULT_MODE
   * in cv-i18n.ts): se quella cambia, vanno cambiate con lei. /en/cv era la
   * pagina CV inglese prima che anche l'inglese avesse una lente nel path.
   */
  redirects: {
    "/home": "/",
    "/cv": "/design",
    "/creative": "/design",
    "/human": "/ai",
    "/en/cv": "/en/design",
  },
  adapter: vercel({
    // Rendering PDF server-side (render-pdf.ts, playwright-core +
    // @sparticuz/chromium) più le due chiamate Gemini possono avvicinarsi
    // al default di 10s — vedi AGENTS.md per il fallback se il piano Vercel
    // attuale non copre 60s.
    maxDuration: 60,
    // @sparticuz/chromium risolve il proprio binario con path relativi al
    // proprio pacchetto: se il tracciamento automatico dei file lo perde, la
    // funzione fallisce a runtime con "input directory .../bin does not
    // exist". Forzarlo esplicitamente è la mitigazione raccomandata dal
    // pacchetto stesso per bundler come questo — vedi AGENTS.md, è comunque
    // la parte meno verificabile senza un deploy reale (render-pdf.ts ha un
    // fallback: se questo fallisce, il tool torna al solo JSON scaricabile).
    // Elencati singolarmente e non con un glob "bin/**": includeFiles li
    // passa a @vercel/nft così come sono, nessuna espansione — un glob
    // letterale fallisce con ENOENT in fase di build (provato).
    includeFiles: [
      "node_modules/@sparticuz/chromium/bin/al2023.tar.br",
      "node_modules/@sparticuz/chromium/bin/chromium.br",
      "node_modules/@sparticuz/chromium/bin/fonts.tar.br",
      "node_modules/@sparticuz/chromium/bin/swiftshader.tar.br",
    ],
  }),
  integrations: [
    lit(),
    sitemap({
      // Il tool privato non deve comparire in sitemap.xml — non è contenuto
      // del CV, è un'utility interna dietro passphrase.
      // /lab/ sono prototipi di layout: stessa ragione, non sono il CV.
      // /old-version/ è la versione precedente del sito: raggiungibile per
      // poterla mostrare, ma non deve competere con quella attuale.
      filter: (page) =>
        !page.includes("/tools/") && !page.includes("/lab/") && !page.includes("/old-version/"),
    }),
    stripComments(),
  ],
  vite: {
    resolve: {
      alias: {
        "@cv-data": resolve(__dirname, "../src/data/cv.ts"),
        "@cv-data-en": resolve(__dirname, "../src/data/cv.en.ts"),
        "@cv-pdf-template": resolve(__dirname, "../scripts/cv-pdf-template.ts"),
        // Vite-bundled JSON import (see pdf-assets-loader.ts) instead of a
        // runtime fs.readFileSync: that path used to be resolved relative to
        // __dirname at request time, which broke twice over once esbuild
        // flattened the function bundle — @vercel/nft never traced the file
        // in, and even if it had, the bundled chunk's __dirname sits nested
        // under dist/server/chunks/, several directories off from where the
        // "../../../../generated/..." math assumed it would be. Importing it
        // here instead makes Vite inline the JSON at build time, so there is
        // no runtime file read left to break.
        "@pdf-assets": resolve(__dirname, "../generated/pdf-assets.json"),
      },
    },
    build: {
      rollupOptions: {
        // @sparticuz/chromium individua il proprio binario con path relativi
        // al pacchetto stesso — bundlarlo li rompe. Raccomandazione esplicita
        // del pacchetto per esbuild/webpack/rollup, vedi il suo README.
        external: ["@sparticuz/chromium"],
      },
    },
    // Il pre-bundler esbuild di Vite (anche solo per `astro check`) andava in
    // OOM provando a processare @sparticuz/chromium — il pacchetto include
    // binari Chromium compressi da decine di MB nella propria cartella bin/,
    // non codice da pre-ottimizzare. playwright-core esclusa per lo stesso
    // motivo (nessun bundling di binari nativi).
    optimizeDeps: {
      exclude: ["@sparticuz/chromium", "playwright-core"],
    },
    ssr: {
      external: ["@sparticuz/chromium", "playwright-core"],
    },
  },
});
