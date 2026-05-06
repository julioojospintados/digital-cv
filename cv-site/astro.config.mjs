// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

import lit from '@astrojs/lit';
import sitemap from '@astrojs/sitemap';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://giulioocchipinti.vercel.app',
  // Comprime l'HTML in output: rimuove commenti <!-- -->, spazi ridondanti, newline
  compressHTML: true,
  integrations: [lit(), sitemap()],
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
