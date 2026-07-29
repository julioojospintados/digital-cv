import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the alias defined in astro.config.mjs so tests can import cv data
      "@cv-data": resolve(__dirname, "../src/data/cv.ts"),
      "@cv-data-en": resolve(__dirname, "../src/data/cv.en.ts"),
    },
  },
  test: {
    // .js incluso oltre a .ts: strip-html-comments è JS con JSDoc perché deve
    // essere importabile da astro.config.mjs, che gira prima di ogni build TS.
    include: ["src/**/*.test.{ts,js}", "src/**/*.spec.{ts,js}"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // Prima misurava solo src/islands/, quindi la copertura sembrava buona
      // ignorando lib/ e scripts/ — cioè la logica pura che regge la parità
      // IT/EN e il mode system, dove i bug sono già usciti in passato.
      include: ["src/islands/**/*.ts", "src/lib/**/*.{ts,js}", "src/scripts/mode-helpers.ts"],
      exclude: ["src/**/*.test.{ts,js}", "src/**/*.spec.{ts,js}"],
    },
  },
});
