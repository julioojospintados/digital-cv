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
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/islands/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
});
