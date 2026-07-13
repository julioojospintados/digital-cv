// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import lit from '@astrojs/lit';
import sitemap from '@astrojs/sitemap';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @param {string} dir @returns {Promise<string[]>} */
async function walkHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walkHtmlFiles(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

// compressHTML rimuove solo spazi/newline ridondanti, NON i commenti <!-- -->
// (verificato: sopravvivono in dist anche con compressHTML:true) — i commenti
// dev nei file .astro (nomi di file, decisioni implementative) finivano così
// leggibili da "Visualizza sorgente" da qualunque visitatore. Protegge il
// contenuto di <script>/<style> per non toccare eventuale `<!--` letterale
// dentro JSON-LD o codice inline. Nessun marker di hydration Lit/Astro usa
// commenti in questo setup (verificato in dist prima di attivarlo).
/** @param {string} html @returns {string} */
function stripHtmlComments(html) {
  /** @type {string[]} */
  const blocks = [];
  const protectedHtml = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, (/** @type {string} */ match) => {
    blocks.push(match);
    return `@@PROTECTED_BLOCK_${blocks.length - 1}@@`;
  });
  const stripped = protectedHtml.replace(/<!--[\s\S]*?-->/g, '');
  return stripped.replace(/@@PROTECTED_BLOCK_(\d+)@@/g, (/** @type {string} */ _, /** @type {string} */ i) => blocks[Number(i)]);
}

function stripComments() {
  return {
    name: 'strip-html-comments',
    hooks: {
      'astro:build:done': async (/** @type {{ dir: URL }} */ { dir }) => {
        const outDir = fileURLToPath(dir);
        const files = await walkHtmlFiles(outDir);
        await Promise.all(
          files.map(async (/** @type {string} */ file) => {
            const html = await readFile(file, 'utf-8');
            await writeFile(file, stripHtmlComments(html), 'utf-8');
          }),
        );
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://giulio-occhipinti.com',
  // Comprime spazi/newline ridondanti in output — i commenti li rimuove
  // stripComments() sotto, in un hook post-build separato.
  compressHTML: true,
  integrations: [lit(), sitemap(), stripComments()],
  vite: {
    plugins: [],
    resolve: {
      alias: {
        '@cv-data': resolve(__dirname, '../src/data/cv.ts'),
        '@cv-data-en': resolve(__dirname, '../src/data/cv.en.ts'),
      },
    },
  },
});
