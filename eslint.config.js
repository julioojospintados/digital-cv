// ESLint flat config — copre entrambi i progetti del repo (root MCP/HTTP e
// cv-site/) da un unico punto: sono due package npm separati ma un solo
// codebase, e due configurazioni divergerebbero come è già successo alle
// skill .claude/ vs .github/.
//
// eslint-config-prettier va SEMPRE per ultimo: spegne le regole stilistiche
// che confliggono con Prettier, unica autorità sulla formattazione.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.astro/**",
      "**/.vercel/**",
      "**/coverage/**",
      "cv-site/public/**",
      "cv-output/**",
      "cv-pdf-preview/**",
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,

  {
    rules: {
      // Il codice usa `_prefisso` per gli helper di modulo volutamente
      // privati (_distFromCenter, _1rem, _gridLocked in index-init.ts):
      // segnalarli come inutilizzati sarebbe un falso positivo sistematico.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // `any` esiste in punti di confine reali (gate di consenso su
      // window.__cvInit*): warning, non errore che blocca la CI.
      "@typescript-eslint/no-explicit-any": "warn",
      // Il non-null assertion è la forma scelta nel codice per i nodi DOM
      // garantiti dal template Astro (getElementById("preloader")!).
      "@typescript-eslint/no-non-null-assertion": "off",
      // I catch vuoti qui sono deliberati e commentati (storage bloccato in
      // navigazione privata, fullscreen negato): il commento spiega il perché,
      // ma per ESLint il blocco resta sintatticamente vuoto.
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },

  {
    // Codice che gira nel browser: pagine, island Lit, script client.
    files: ["cv-site/src/**/*.{ts,js,astro}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },

  {
    // Node: layer MCP/HTTP, script di utilità, config di build.
    files: ["src/**/*.ts", "scripts/**/*.{js,mjs,ts}", "cv-site/*.{ts,mjs,cjs}", "*.{js,mjs,ts}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  {
    // Script di utilità: console è l'output all'utente, non un residuo di debug.
    // Girano in Node ma pilotano un browser via Playwright, quindi il corpo
    // dei page.evaluate() usa document/window: servono entrambi i set di globals.
    files: ["scripts/**/*.{js,mjs,ts}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      "no-console": "off",
      // record-demo-playwright.js è CommonJS per scelta (gira con `node` puro).
      "@typescript-eslint/no-require-imports": "off",
      // `cond ? ok(...) : fail(...)` come statement è la forma usata da
      // qa-mobile.js per ogni asserzione: compatta e leggibile in un report
      // sequenziale. Consentita qui, non nel codice applicativo.
      "@typescript-eslint/no-unused-expressions": ["error", { allowTernary: true }],
    },
  },

  {
    // Layer MCP: stdout è riservato al protocollo JSON-RPC, si scrive solo
    // via logger. La regola rende la convenzione verificabile invece che
    // affidata alla memoria di chi scrive — vedi AGENTS.md → "Do NOT".
    files: ["src/**/*.ts"],
    ignores: ["src/**/*.test.ts", "src/utils/logger.ts"],
    rules: {
      "no-console": "error",
    },
  },

  prettier,
);
