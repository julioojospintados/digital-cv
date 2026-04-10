// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

import tailwindcss from '@tailwindcss/vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        // Points to the root src/data/cv.ts — single source of truth
        '@cv-data': resolve(__dirname, '../src/data/cv.ts'),
      },
    },
  },
});
