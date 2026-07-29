// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import { resolve } from "path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import lit from "@astrojs/lit";
import sitemap from "@astrojs/sitemap";

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
  integrations: [lit(), sitemap(), stripComments()],
  vite: {
    resolve: {
      alias: {
        "@cv-data": resolve(__dirname, "../src/data/cv.ts"),
        "@cv-data-en": resolve(__dirname, "../src/data/cv.en.ts"),
      },
    },
  },
});
