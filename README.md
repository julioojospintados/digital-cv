# Digital CV — Giulio Occhipinti

**CV digitale interattivo** costruito come un'esperienza di esplorazione narrativa ("The Explorer's Journey").
Tre modalità — TECH, CREATIVE, HUMAN — raccontano lo stesso profilo da tre prospettive diverse.

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
│   ├── astro.config.mjs            ← Configurazione Astro (integrazioni, Lit, Tailwind)
│   ├── DESIGN.md                   ← Specifica completa del design system (knolling, mode, colori, tipografia)
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── public/
│   │   ├── favicon.ico / favicon.svg
│   │   ├── fonts/
│   │   │   └── Lexend/             ← lexend-latin-800-normal.woff2 (preloaded, font-display:block)
│   │   └── knolling/               ← Asset visivi knolling (camera, compass, laptop, ecc.)
│   │
│   └── src/
│       ├── components/             ← Componenti Astro statici (server-rendered)
│       │   ├── HeroSection.astro   ← Sezione hero della landing page
│       │   ├── Navbar.astro        ← Barra di navigazione con <go-logo>
│       │   ├── ExperienceSection.astro  ← Card esperienze lavorative
│       │   ├── EducationSection.astro   ← Card formazione
│       │   ├── SkillsSection.astro      ← Griglia skill (quadrati, no barre percentuali)
│       │   ├── ProjectsSection.astro    ← Card progetti
│       │   └── cards/              ← Card riutilizzabili per ogni sezione
│       │       ├── ExpCard.astro   ← Card esperienza (tag mode, impactScore, logo azienda)
│       │       ├── AiCard.astro    ← Card AI-enhanced workflow (badge impactScore)
│       │       ├── ProjectCard.astro ← Card progetto (tech stack, link)
│       │       ├── SkillSquare.astro  ← Skill quadrato con glow (NO barre %)
│       │       ├── SoftItem.astro  ← Item soft / transversal skill
│       │       └── EduItem.astro   ← Item formazione / certificazione
│       │
│       ├── islands/                ← Lit web components interattivi (client-side)
│       │   ├── GoLogo.lit.ts       ← <go-logo>: logo animato, click = reset a /, cambia colore per mode
│       │   ├── ModeSwitcher.ts     ← <mode-switcher>: selettore TECH / CREATIVE / HUMAN / MANAGEMENT
│       │   └── stores/
│       │       ├── modeStore.ts    ← NanoStore globale per il mode attivo (tech/creative/human/management)
│       │       └── modeStore.test.ts
│       │
│       ├── layouts/
│       │   └── Layout.astro        ← Layout base (head, font, global CSS, view transitions)
│       │
│       ├── pages/
│       │   ├── index.astro         ← Landing page: scelta del mode (TECH / CREATIVE / HUMAN)
│       │   ├── cv.astro            ← Pagina CV completa in italiano
│       │   └── en/                 ← (placeholder) Versione inglese del CV
│       │
│       └── styles/
│           └── global.css          ← CSS custom properties per i 3 mode (colori, opacity, ecc.)
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
│   │   └── errors.test.ts
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
│   └── parse-cv.ts                 ← Script per estrarre/parsare dati dal CV sorgente
│
├── _cv-source/
│   └── extracted-text.txt          ← Testo grezzo estratto dal CV originale (sorgente dati)
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
│   └── skills/                     ← Skill specializzate caricate da Copilot su richiesta
│       ├── knolling-cv/
│       │   └── SKILL.md            ← Contesto globale progetto — caricata SEMPRE per prima
│       ├── design-system/
│       │   ├── SKILL.md            ← UI, animazioni Emil Kowalski, knolling, GSAP, Tailwind 4, Awwwards
│       │   └── knolling-reference.png  ← Foto di riferimento layout knolling
│       ├── identity/
│       │   └── SKILL.md            ← Bio, tone of voice, narrativa GO, job hunting
│       ├── agile-methodology/
│       │   └── SKILL.md            ← Agile snello, Lean, PM per PMI, impactScore, sprint
│       ├── mcp-architecture/
│       │   └── SKILL.md            ← MCP tools, Hono, cv.ts, test, AI workflow
│       └── partnership-strategy/
│           └── SKILL.md            ← Fractional partner, posizionamento consulente PMI
│
├── AGENTS.md                       ← Guida per agenti AI (struttura, convenzioni, where to make changes)
├── .env.example                    ← Template variabili d'ambiente (non committare .env)
├── package.json                    ← Dipendenze e script npm per il layer MCP/HTTP
├── tsconfig.json                   ← Configurazione TypeScript per src/
└── vitest.config.ts                ← Configurazione test Vitest per src/
```

---

## Comandi npm

### Sito CV (`cv-site/`)

| Comando           | Azione                             |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Dev server Astro con hot reload    |
| `npm run build`   | Build statica produzione → `dist/` |
| `npm run preview` | Anteprima del build statico        |

### Server MCP / HTTP (root)

| Comando               | Azione                                 |
| --------------------- | -------------------------------------- |
| `npm run build`       | Compila TypeScript → `dist/`           |
| `npm run dev`         | Watch mode (ricompila automaticamente) |
| `npm start`           | Avvia il server compilato              |
| `npm run build:start` | Build + avvio in un comando            |

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

## Copilot AI — meccanismi di personalizzazione

Quattro livelli di personalizzazione, dal più specifico al più generale:

### 1. Skills (`.github/skills/`)

Conoscenza dominio avanzata caricata **su richiesta** da Copilot prima di rispondere.

| Skill                  | Quando si carica                                               |
| ---------------------- | -------------------------------------------------------------- |
| `knolling-cv`          | **Sempre** per prima — contesto globale del progetto           |
| `design-system`        | UI, animazioni, card, knolling, GSAP, Tailwind 4, Awwwards     |
| `identity`             | Bio, tone of voice, narrativa GO, copy, job hunting            |
| `agile-methodology`    | Esperienze Agile, sprint, backlog, impactScore, certificazioni |
| `mcp-architecture`     | Backend, MCP tools, Hono, test, cv.ts, AI workflow             |
| `partnership-strategy` | Posizionamento Fractional Partner, offerta per PMI             |

### 2. Prompt riutilizzabili (`.vscode/prompts/*.prompt.md`)

Invocabili con `/nome-file` in chat. Usali per workflow ripetuti.

```
/implement-feature   ← aggiunge una feature rispettando le convenzioni
/add-tool            ← crea un nuovo MCP tool
/add-resource        ← crea una nuova MCP resource
/debug-mcp           ← diagnostica errori nel server MCP
/cv-intake           ← intake strutturato per aggiornare i dati CV
```

### 3. Instructions scoped (`.vscode/*.instructions.md`)

Iniettate **automaticamente** nel contesto Copilot in base al pattern `applyTo`:

- `design.instructions.md` → attivo su `cv-site/src/**` (regole visual design)
- `typescript.instructions.md` → attivo su `src/**/*.ts` (convenzioni TypeScript/MCP)
- `http.instructions.md` → attivo su `src/http/**` (convenzioni Hono/HTTP)

### 4. Istruzioni globali (`.github/copilot-instructions.md`)

Sempre attive per qualsiasi conversazione in questo workspace.
Contiene: scopo professionale, GO concept, struttura progetto, comportamento Copilot.

---

## MCP server integrati

Configurati in `.vscode/mcp.json`:

| Server                | Stato     | Cosa fa                                             |
| --------------------- | --------- | --------------------------------------------------- |
| `mcp-base-template`   | ✅ attivo | Server MCP locale — espone cv.ts come tool/resource |
| `memory`              | ✅ attivo | Knowledge graph persistente tra sessioni            |
| `sequential-thinking` | ✅ attivo | Ragionamento strutturato step-by-step               |
| `filesystem`          | ✅ attivo | Lettura/scrittura file nel workspace                |
| `github`              | ✅ attivo | Repos, issues, PR, branch, commit                   |
| `gitlab`              | ✅ attivo | Repos, MR, issues, pipelines                        |
| `playwright`          | ✅ attivo | Browser automation, screenshot, E2E                 |
| `google-maps`         | ✅ attivo | Geocoding, places, directions, distance matrix      |

Server commentati (attivabili rimuovendo `//`): `fetch`, `postgres`, `sqlite`, `git`, `context7`,
`tavily`, `n8n`, `notion`, `figma`, `office-word/excel/powerpoint`, `task-master`, `tam`, `fred`.

---

## Sicurezza

- I token/segreti vanno in `.env` (mai committare — già in `.gitignore`)
- VS Code li gestisce via `${input:id}` nel `mcp.json` (prompt sicuro una volta a sessione)
- Non scrivere mai su `stdout` nel layer MCP — riservato al protocollo JSON-RPC: usa `logger.ts`
