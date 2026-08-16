# Digital CV — Giulio Occhipinti

**CV digitale interattivo** costruito come un'esperienza di esplorazione narrativa ("The Explorer's Journey").
Quattro modalità — TECH, CREATIVE, HUMAN, MANAGEMENT — raccontano lo stesso profilo da quattro prospettive diverse.

Il progetto è composto da due sistemi indipendenti:

| Sistema    | Scopo                                                                    |
| ---------- | ------------------------------------------------------------------------ |
| `cv-site/` | Sito Astro statico — il CV visuale e interattivo                         |
| `src/`     | Server MCP (stdio) + HTTP API (Hono) — AI tooling per accesso ai dati CV |

---

## Quickstart

```bash
# — Sito CV —
cd cv-site
npm install
npm run dev          # avvia il dev server Astro su http://localhost:4321

# — Server MCP / HTTP —
npm install          # nella root del progetto
npm run build:start  # compila e avvia il server MCP su stdio
```

---

## Struttura del progetto

```
Digital_CV/
│
├── cv-site/                        ← Sito Astro — il CV vero e proprio
│   ├── astro.config.mjs            ← Configurazione Astro (integrazioni: Lit, Sitemap, strip-comments)
│   ├── middleware.ts               ← Vercel Routing Middleware — IT/EN per paese (edge, non Astro middleware)
│   ├── postcss.config.cjs          ← Unico plugin: postcss-custom-media (@custom-media condivise)
│   ├── DESIGN.md                   ← Specifica completa del design system (knolling, mode, colori, tipografia)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   │
│   ├── public/
│   │   ├── favicon.ico / favicon-32.png / favicon-192.png / apple-touch-icon.png
│   │   ├── robots.txt              ← Blocca i crawler di training AI, ammette i fetch on-demand
│   │   ├── og-cover.jpg            ← Immagine Open Graph (1200×630, screenshot reale della home)
│   │   ├── cv/                     ← PDF generati da scripts/generate-cv-pdf.ts (IT + EN)
│   │   ├── qr/                     ← QR code statici del sito (varianti chiare/scure, firma, biglietto)
│   │   ├── fonts/
│   │   │   └── Lexend/             ← lexend-latin-800-normal.woff2 (preloaded, font-display:block)
│   │   ├── knolling/               ← Asset visivi knolling (camera, compass, laptop, ecc.)
│   │   └── photos/                 ← Foto personali (trip/, belongings/) usate nella sezione "Chi sono"
│   │
│   └── src/
│       ├── components/             ← Componenti Astro statici (server-rendered)
│       │   ├── ConsentBanner.astro ← Banner consenso PostHog (gate in Layout.astro)
│       │   ├── ContactFooter.astro ← Footer contatti condiviso tra le pagine
│       │   ├── WorkDesignSystem.astro ← Sezione design system nei case study /work
│       │   └── cards/              ← Card riutilizzabili per ogni sezione
│       │       ├── ExpCard.astro   ← Card esperienza (tag mode, impactScore, logo azienda)
│       │       ├── AiCard.astro    ← Card AI-enhanced workflow (badge impactScore)
│       │       ├── ProjectCard.astro ← Card progetto (tech stack, link)
│       │       ├── SkillSquare.astro  ← Skill quadrato con glow (NO barre %)
│       │       ├── SoftItem.astro  ← Item soft / transversal skill
│       │       └── WorkIndexCard.astro ← Card indice dei case study /work
│       │
│       ├── islands/                ← Lit web components interattivi (client-side)
│       │   ├── GoLogo.lit.ts       ← <go-logo>: logo animato, click = reset a /, cambia colore per mode
│       │   ├── FloatingMenu.lit.ts ← <floating-menu>: FAB contatti / feedback
│       │   ├── SkillForceGraph.lit.ts ← <skill-force-graph>: grafo D3 force-directed (lazy-loaded)
│       │   └── stores/
│       │       ├── modeStore.ts    ← NanoStore globale per il mode attivo (tech/creative/human)
│       │       └── modeStore.test.ts
│       │
│       ├── layouts/
│       │   └── Layout.astro        ← Layout base (head/SEO/JSON-LD, font, Lenis, cursor custom, FAB)
│       │
│       ├── lib/
│       │   ├── cv-view-model.ts    ← Costruisce il view model della pagina CV (skill, cluster, hero) — condiviso IT/EN
│       │   ├── cv-i18n.ts          ← Dizionari e tipi del mode system per lingua
│       │   ├── exp-clusters.ts     ← Definizione condivisa dei cluster esperienza (IT/EN, refs exp+proj)
│       │   └── recent-commits.ts   ← Ultimi commit letti da git a build time (badge "ciclo di sistemazione")
│       │
│       ├── pages/
│       │   ├── index.astro         ← Entry IT: preloader GO + knolling + scelta del mode
│       │   ├── [mode].astro        ← Pagina CV per /tech /creative /human
│       │   ├── privacy.astro       ← Informativa privacy (linkata dal banner di consenso)
│       │   ├── work/               ← Indice + case study progetti ([slug].astro)
│       │   ├── en/                 ← Versione inglese (index, cv, privacy, work/)
│       │   ├── home.astro          ← Legacy — redirect 301 a /
│       │   └── cv.astro            ← Legacy — redirect 301 a /creative (DEFAULT_MODE)
│       │
│       ├── scripts/                ← Logica client condivisa (vanilla TS + GSAP)
│       │   ├── cv-init.ts          ← Init pagina CV: mode switch, scroll, accordion, carousel feedback
│       │   ├── index-init.ts       ← Init home: preloader, knolling, mode card, launch journey
│       │   ├── mode-helpers.ts     ← Funzioni pure del mode system (testate in mode-helpers.test.ts)
│       │   ├── work-journey.ts     ← Animazioni pagine /work
│       │   ├── memory-drawer.ts    ← Drawer foto/racconto "Chi sono" (page-flip 3D)
│       │   └── intro-seen.ts       ← Flag sessionStorage per saltare l'intro GO al ritorno
│       │
│       └── styles/
│           ├── global.css          ← CSS custom properties per i 4 mode, reset, cursor, focus
│           ├── cv-page.css         ← Stili pagina CV ([mode].astro / en/cv.astro)
│           ├── index-page.css      ← Stili home/entry
│           └── work-page.css       ← Stili pagine /work
│
├── src/                            ← Server MCP + HTTP API (Node.js / TypeScript)
│   ├── index.ts                    ← Entry point MCP (stdio transport) — non aggiungere HTTP qui
│   ├── http.ts                     ← Entry point HTTP (Hono/Node) — non aggiungere MCP qui
│   ├── server.ts                   ← Factory McpServer — registra tool, resource, prompt
│   │
│   ├── config/
│   │   └── env.ts                  ← Variabili d'ambiente validate con Zod — unica fonte di config
│   │
│   ├── data/
│   │   ├── cv.ts                   ← Dati CV completi in ITALIANO — source of truth
│   │   ├── cv.test.ts              ← Test dati CV italiano
│   │   ├── cv.en.ts                ← Traduzione INGLESE del CV (importa i tipi da cv.ts)
│   │   └── cv.en.test.ts           ← Test dati CV inglese
│   │
│   ├── http/
│   │   ├── app.ts                  ← Hono app factory + error handler + /openapi.json
│   │   ├── app.test.ts
│   │   ├── errors.ts               ← Classi di errore HTTP tipizzate (NotFoundError, ValidationError, ecc.)
│   │   ├── errors.test.ts
│   │   └── routes/
│   │       └── qr.ts               ← /api/qr — genera QR code (JSON base64, PNG, SVG)
│   │
│   ├── tools/
│   │   ├── index.ts                ← Registry tool MCP (registra tutti i tool qui)
│   │   ├── echo.ts                 ← Tool di esempio — copia come template per nuovi tool
│   │   └── echo.test.ts
│   │
│   ├── resources/
│   │   └── index.ts                ← Registry resource MCP
│   │
│   ├── prompts/
│   │   └── index.ts                ← Registry prompt template MCP
│   │
│   └── utils/
│       └── logger.ts               ← Logger MCP-safe (scrive su stderr, mai su stdout)
│
├── scripts/
│   ├── parse-cv.ts                 ← Estrae/parsa dati dal CV sorgente
│   ├── generate-cv-pdf.ts          ← Genera il CV knolling in PDF A4 con QR (npm run pdf:cv)
│   ├── generate-ux-cv.ts           ← Genera il CV UX/UI per le candidature (npm run pdf:ux)
│   ├── gen-og-image.mjs            ← Genera l'immagine Open Graph dalla home
│   ├── qa-mobile.js                ← QA responsive via Playwright
│   └── record-demo-playwright.js   ← Registra la demo video del sito
│
├── docs/
│   ├── RECORD-DEMO.md              ← Come registrare il video demo del sito
│   └── UX-Mode-Pages-Proposta.md   ← Proposta UX per le pagine mode (documento storico, apr. 2026)
│
├── .vscode/                        ← Configurazione VS Code e Copilot AI
│   ├── mcp.json                    ← Server MCP attivi in VS Code (GitHub, Sequential Thinking, ecc.)
│   ├── settings.json               ← Impostazioni progetto + Copilot
│   │
│   ├── design.instructions.md      ← [COPILOT] Regole design auto-iniettate su cv-site/src/**
│   │                                   (knolling, mode, colori, card, skill grid, GSAP)
│   ├── typescript.instructions.md  ← [COPILOT] Convenzioni TypeScript auto-iniettate su src/**/*.ts
│   │                                   (Zod, logger, no-stdout, ES modules, estensioni .js)
│   ├── http.instructions.md        ← [COPILOT] Convenzioni Hono/HTTP auto-iniettate su src/http/**
│   │
│   └── prompts/                    ← Prompt slash riutilizzabili in Copilot chat
│       ├── add-tool.prompt.md      ← /add-tool: guida per creare un nuovo MCP tool
│       ├── add-resource.prompt.md  ← /add-resource: guida per creare una nuova MCP resource
│       ├── implement-feature.prompt.md  ← /implement-feature: aggiunge una feature rispettando le convenzioni
│       ├── debug-mcp.prompt.md     ← /debug-mcp: diagnostica errori nel server MCP
│       └── cv-intake.prompt.md     ← /cv-intake: intake strutturato per aggiornare i dati CV
│
├── .github/
│   ├── copilot-instructions.md     ← [COPILOT] Istruzioni globali iniettate in ogni chat
│   │                                   (scopo progetto, GO concept, gamification, comportamento AI)
│   ├── workflows/ci.yml            ← CI: lint+format, server (build/typecheck/test), sito (check/test/build)
│   ├── dependabot.yml              ← Aggiornamenti mensili npm (root + cv-site) e GitHub Actions
│   └── skills/                     ← Skill specializzate caricate da Copilot su richiesta
│       ├── knolling-cv/
│       │   └── SKILL.md            ← Contesto globale progetto — caricata SEMPRE per prima
│       ├── design-system/
│       │   ├── SKILL.md            ← UI, animazioni Emil Kowalski, knolling, GSAP, CSS custom properties, Awwwards
│       │   └── knolling-reference.png  ← Foto di riferimento layout knolling
│       ├── identity/
│       │   ├── SKILL.md            ← Bio, tone of voice, narrativa GO, job hunting
│       │   └── writing-style.md    ← Regole di scrittura mandatorie (da leggere prima di ogni testo)
│       ├── agile-methodology/
│       │   └── SKILL.md            ← Agile snello, Lean, PM per le aziende, impactScore, sprint
│       ├── mcp-architecture/
│       │   └── SKILL.md            ← MCP tools, Hono, cv.ts, test, AI workflow
│       └── partnership-strategy/
│           └── SKILL.md            ← Fractional partner, posizionamento consulente per le aziende
│
├── .claude/                         ← Configurazione Claude Code
│   └── skills/                     ← Fonte di verità delle skill (le .github/skills sono il mirror Copilot)
│       ├── …/SKILL.md              ← Stesse 6 skill di dominio elencate sopra
│       ├── identity/writing-style.md ← Regole di scrittura mandatorie (lettura obbligata prima di ogni testo)
│       └── caveman/                ← Solo Claude — risposta ultra-compressa (`/caveman`)
│
├── .agents/skills/caveman/         ← Copia richiesta dal formato di skills-lock.json
│
├── AGENTS.md                       ← Guida per agenti AI (struttura, convenzioni, where to make changes)
├── CLAUDE.md                       ← Entry point Claude Code (importa AGENTS.md + regole skill-loading/MCP)
├── LICENSE                         ← Proprietaria: pubblica per valutazione, nessun diritto di riuso
├── .mcp.json                       ← Server MCP per Claude Code
├── .env.example                    ← Template variabili d'ambiente (non committare .env)
├── .editorconfig / .gitattributes  ← Stile e line-ending deterministici fuori da VS Code
├── .prettierrc.json / .prettierignore  ← Formattazione (unica autorità sullo stile)
├── eslint.config.js                ← ESLint flat config — copre root e cv-site insieme
├── skills-lock.json                ← Lock delle skill installate da sorgente esterna (caveman)
├── package.json                    ← Dipendenze e script npm per il layer MCP/HTTP
├── tsconfig.json                   ← TypeScript per src/ (build, esclude i test)
├── tsconfig.test.json              ← TypeScript per test e scripts/ (solo --noEmit, `npm run typecheck`)
└── vitest.config.ts                ← Configurazione test Vitest per src/
```

---

## Comandi npm

### Sito CV (`cv-site/`)

| Comando           | Azione                                             |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Dev server Astro con hot reload                    |
| `npm run build`   | Build statica produzione → `dist/`                 |
| `npm run preview` | Anteprima del build statico                        |
| `npm run check`   | Type-check di `.astro`/`.ts` (`astro check`)       |
| `npm test`        | Test Vitest (`mode-helpers`, `modeStore`)          |

### Server MCP / HTTP + utility (root)

| Comando                    | Azione                                          |
| -------------------------- | ----------------------------------------------- |
| `npm run build`            | Compila TypeScript → `dist/`                    |
| `npm run dev`              | Watch mode (ricompila automaticamente)          |
| `npm start`                | Avvia il server MCP compilato (stdio)           |
| `npm run build:start`      | Build + avvio MCP in un comando                 |
| `npm run http:start`       | Avvia il server HTTP (Hono)                     |
| `npm run http:build:start` | Build + avvio HTTP in un comando                |
| `npm test`                 | Test Vitest (`src/`)                            |
| `npm run typecheck`        | Type-check di test e `scripts/` (esclusi dalla build) |
| `npm run lint`             | ESLint su tutto il repo (root + `cv-site/`)     |
| `npm run format`           | Prettier in scrittura · `format:check` per verificare |
| `npm run parse-cv`         | Estrae/parsa dati dal CV sorgente               |
| `npm run pdf:cv`           | Genera i PDF del CV (IT + EN) in `cv-site/public/cv/` |
| `npm run pdf:ux`           | Genera il CV UX/UI per le candidature           |

---

## Aggiungere un nuovo tool MCP

```bash
# Usa il prompt Copilot (digita in chat):
/add-tool
```

Oppure manualmente:

1. Crea `src/tools/mio-tool.ts` copiando `echo.ts`
2. Cambia nome, descrizione e schema Zod
3. Registra in `src/tools/index.ts`
4. Verifica: `npm run build`

---

## Personalizzazione AI — Copilot & Claude Code

Il progetto supporta due agenti AI in parallelo, con struttura equivalente ma cartelle separate:

| Livello | Copilot (VS Code) | Claude Code |
| --- | --- | --- |
| Istruzioni globali | `.github/copilot-instructions.md` | `CLAUDE.md` (importa `AGENTS.md`) |
| Skill di dominio, caricate su richiesta | `.github/skills/*/SKILL.md` | `.claude/skills/*/SKILL.md` |
| Instructions scoped per path (`applyTo`) | `.vscode/*.instructions.md` | — (regole equivalenti dentro le skill) |
| Prompt/comandi riutilizzabili | `.vscode/prompts/*.prompt.md` | `.claude/skills/<nome>/SKILL.md` (slash command) |

Le skill di dominio sono le stesse in entrambi gli strumenti: `.claude/skills/` è la fonte
di verità e `.github/skills/` ne è il mirror, identico a meno dei path interni. Modificando
una skill, aggiorna entrambe le copie nella stessa sessione — sono già divergute in passato.

| Skill                  | Quando si carica                                               |
| ---------------------- | -------------------------------------------------------------- |
| `knolling-cv`          | **Sempre** per prima — contesto globale del progetto           |
| `design-system`        | UI, animazioni, card, knolling, GSAP, CSS custom properties, Awwwards |
| `identity`             | Bio, tone of voice, narrativa GO, copy, job hunting            |
| `agile-methodology`    | Esperienze Agile, sprint, backlog, impactScore, certificazioni |
| `mcp-architecture`     | Backend, MCP tools, Hono, test, cv.ts, AI workflow             |
| `partnership-strategy` | Posizionamento Fractional Partner, offerta per le aziende      |

Prompt Copilot riutilizzabili (`.vscode/prompts/*.prompt.md`, invocabili con `/nome-file`):

```
/implement-feature   ← aggiunge una feature rispettando le convenzioni
/add-tool            ← crea un nuovo MCP tool
/add-resource        ← crea una nuova MCP resource
/debug-mcp           ← diagnostica errori nel server MCP
/cv-intake           ← intake strutturato per aggiornare i dati CV
```

Solo Claude Code: `.claude/skills/caveman/SKILL.md` — modalità di risposta ultra-compressa, invocabile con `/caveman` (installata via `skills-lock.json`, mirror in `.agents/skills/caveman/`).

---

## MCP server integrati

Il progetto usa due config MCP separate: `.vscode/mcp.json` per Copilot/VS Code e `.mcp.json`
(root) per Claude Code.

`.vscode/mcp.json` (Copilot/VS Code):

| Server                | Stato         | Cosa fa                                         |
| --------------------- | ------------- | ----------------------------------------------- |
| `mcp-base-template`   | ✅ attivo     | Server MCP locale del progetto (vedi `src/`)    |
| `sequential-thinking` | ✅ attivo     | Ragionamento strutturato step-by-step           |
| `playwright`          | ✅ attivo     | Browser automation, screenshot, E2E             |
| `github`              | ⚪ on-demand  | Repos, issues, PR — commentato, richiede token  |
| `gsc`                 | ⚪ on-demand  | Google Search Console — commentato, richiede key|
| `vercel`              | ⚪ on-demand  | Deploy Vercel — commentato, OAuth remoto        |

`.mcp.json` (Claude Code): server di progetto `mcp-base-template` e `sequential-thinking`,
più alcuni server di workflow personali (`playwright`, `vercel`, `posthog`, `github`, `gsc`).

---

## Sicurezza

- I token/segreti vanno in `.env` (mai committare — già in `.gitignore`)
- VS Code li gestisce via `${input:id}` nel `mcp.json` (prompt sicuro una volta a sessione)
- Non scrivere mai su `stdout` nel layer MCP — riservato al protocollo JSON-RPC: usa `logger.ts`
