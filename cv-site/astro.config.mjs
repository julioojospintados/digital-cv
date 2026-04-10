// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';
import lit from '@astrojs/lit';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [lit()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@cv-data': resolve(__dirname, '../src/data/cv.ts'),
        '@cv-data-en': resolve(__dirname, '../src/data/cv.en.ts'),
      },
    },
  },
});
