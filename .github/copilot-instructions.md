# Digital CV — Copilot Instructions

## Informazioni utente

- **GitHub username**: `julioojospintados`
- **Repo**: `https://github.com/julioojospintados/digital-cv` (privato)

---

## ⚡ Carica sempre all'inizio della sessione

Prima di rispondere a **qualsiasi richiesta** su questo progetto (UI, animazioni, componenti, dati, layout, design, MCP), leggi obbligatoriamente:

- **`.github/skills/knolling-cv/SKILL.md`** — design system completo, GO concept, gamification, standard Awwwards, scopo professionale

---

## Scopo professionale del sito

Questo è il **CV digitale di Giulio Occhipinti per trovare lavoro** — non un portfolio sperimentale.
Target: **Recruiter** (leggibilità, seniorità), **CTO/Tech Lead** (architettura, AI workflow, Angular/Lit), **Art Director** (estetica, knolling, storytelling).
Ogni decisione UI/UX deve rispettare la regola: **l'esperienza dimostra le competenze, non si limita ad elencarle**.

---

## GO: Viaggio e Gamification

"GO" non è un logo — è un **invito al viaggio**. Il sito è strutturato come un gioco narrativo:
- **Preloader**: `G` e `O` volano verso il nome (G→Giulio, O→Occhipinti) — rituale iniziatico
- **Landing `/`**: scegliere TECH / CREATIVE / HUMAN è come **scegliere il proprio personaggio**
- **`/cv`**: le card passive diventano sussurri — l'utente esplora senza mai ricominciare da zero
- **`<go-logo>`**: sempre visibile, click = Master Reset a `/` — mode-reactivo (cyan/orange/gold)
- **CTA semantica**: sempre `GO Tech`, `GO Creative`, `GO Human` — mai "Scopri", "Vedi", "Leggi"

---

## Comportamento Copilot — domande extra-progetto

Quando l'utente fa una domanda **non direttamente legata al codice o al progetto corrente**
(es. domande generali, ricerche, analisi, decisioni, confronti), chiedi **prima di rispondere**:

> "Vuoi che usi:
> - 🔍 **Brave Search** — per cercare informazioni aggiornate online
> - 🧠 **Sequential Thinking** — per ragionare la risposta in modo strutturato step-by-step?
> - Sì / Solo Brave o solo Sequential Thinking/SQ?"

**Non fare questa domanda** per operazioni di codice, build, file, git o MCP — procedi direttamente.

---

## Panoramica progetto

**Digital CV di Giulio Occhipinti** — un CV interattivo con due sistemi indipendenti:

| Entry point | Scopo |
|---|---|
| `cv-site/` | Sito Astro statico — il CV visuale e interattivo |
| `src/index.ts` | Server MCP (stdio) — AI tooling per accesso ai dati CV |
| `src/http.ts` | Server HTTP (Hono) — REST API |

Il **sito principale** (`cv-site/`) usa:
- **Astro** (shell statica, routing)
- **Lit** (web components interattivi — "islands")
- **Tailwind CSS** (grid, spacing, utilities)
- **NanoStores** (stato globale mode: tech / creative / human)
- **View Transitions API** (transizioni animate)

---

## File dati CV — source of truth

| File | Contenuto |
|---|---|
| `src/data/cv.ts` | Dati CV completi in **italiano** — unica fonte di verità |
| `src/data/cv.en.ts` | Traduzione in **inglese** — importa i tipi da `cv.ts` |

Entrambi esportano `cvData` / `cvDataEn` con le sezioni:
`personal`, `social`, `languages`, `experience`, `education`, `certifications`,
`technicalSkills`, `softSkills`, `transversalSkills`, `methodology`, `growthAreas`,
`projects`, `interests`, `socialImpact`

**Non modificare la struttura dei tipi in `cv.ts` senza aggiornare anche `cv.en.ts`.**

---

## Design system — concetto chiave

Il sito si chiama **Knolling / Flat Lay CV**: ogni elemento (esperienza, skill, progetto) è un
"oggetto" disposto su un piano visivo come in una fotografia knolling.

**3 modalità globali** (impostabili via URL `?mode=...` e `localStorage`):

| Mode | URL param | Focus |
|---|---|---|
| TECH | `?mode=tech` | Architetture, codice, sistemi. Tema scuro, neon verde/blu |
| CREATIVE | `?mode=creative` | Racconto, immagine, suono. Tema caldo, editoriale |
| HUMAN | `?mode=human` | Impatto, relazione, presenza. Tema neutro carta |

**Regola card**: ogni card ha tag (`tech`, `creative`, `human`, `logic`, `agile`, ecc.).
Il mode attivo porta le card con tag corrispondenti a `opacity: 1`, le altre a `opacity: var(--card-opacity-passive)`.

**Skill grid**: mai barre percentuali — quadrati cliccabili con bordo/glow proporzionale al livello.

**Sezione AI-Enhanced Workflow**: micro-componenti con `impactScore` (es. `-50% tempo sviluppo`).

Riferimento completo: `cv-site/DESIGN.md`
Regole operative per Copilot: `.vscode/design.instructions.md` (auto-iniettato su `cv-site/src/**`)

---

## Struttura del progetto

```
src/                      ← MCP server + HTTP API (Node.js / TypeScript)
  index.ts                ← Entry point MCP (stdio)
  http.ts                 ← Entry point HTTP (Hono)
  server.ts               ← McpServer factory
  data/
    cv.ts                 ← Dati CV IT (source of truth)
    cv.en.ts              ← Dati CV EN
  config/env.ts           ← Env vars (Zod)
  http/app.ts             ← Hono app
  tools/                  ← MCP tools
  resources/              ← MCP resources
  prompts/                ← MCP prompt templates

cv-site/                  ← Sito Astro (il CV vero e proprio)
  src/
    pages/                ← Astro pages (index, cv, en/)
    components/           ← Componenti Astro statici
    islands/              ← Lit web components interattivi (da creare)
    styles/global.css     ← CSS custom properties per i 3 mode
  DESIGN.md               ← Specifica completa design system

.vscode/
  mcp.json                ← Configurazione server MCP esterni
  design.instructions.md  ← Auto-iniettato su cv-site/src/** con regole design
  typescript.instructions.md ← Auto-iniettato su src/**/*.ts
  http.instructions.md    ← Auto-iniettato su src/http/**
  prompts/                ← Prompt slash riutilizzabili
.github/
  copilot-instructions.md ← Questo file (iniettato in ogni chat)
AGENTS.md                 ← Guida per agenti AI (struttura e convenzioni)
```

---

## Convenzioni MCP layer (`src/`)

- **Tool**: `src/tools/<nome>.ts`, esporta `register<Nome>Tool(server)`, registra in `index.ts`
- **Resource**: `src/resources/<nome>.ts`, esporta `register<Nome>Resource(server)`
- **Non scrivere mai su stdout** — usa `logger` da `src/utils/logger.ts`
- Usa sempre **Zod** per validare parametri dei tool
- Import locali con estensione `.js` (ES modules NodeNext)

## Comandi utili

| Comando | Azione |
|---|---|
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run dev` | Watch mode (ricompila in automatico) |
| `npm start` | Avvia il server compilato |
| `npm run build:start` | Build + avvio in un comando |

## Come aggiungere un nuovo tool

Usa il prompt `.vscode/prompts/add-tool.prompt.md` oppure:

1. Crea `src/tools/mio-tool.ts` copiando `echo.ts`
2. Cambia nome, descrizione e schema Zod
3. Aggiungi la registrazione in `src/tools/index.ts`
4. Esegui `npm run build` per verificare

## Note MCP

- Il server usa **stdio transport** (compatibile con VS Code Copilot, Claude Desktop, ecc.)
- La configurazione VS Code per attivare il server è in `.vscode/mcp.json`
- Ogni `tool` corrisponde a una capability che il modello AI può invocare
- Le `resource` espongono dati leggibili dal modello
- I `prompt` sono template di conversazione riutilizzabili
