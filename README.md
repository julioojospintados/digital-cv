# MCP Base Template

Template riutilizzabile per server **Model Context Protocol (MCP)** scritto in TypeScript.
Copialo, rinominalo e parti subito.

---

## Quickstart

```bash
# 1. Installa le dipendenze
npm install

# 2. Copia le variabili d'ambiente
cp .env.example .env   # compila i token necessari

# 3. Build e avvio
npm run build:start
```

Il server è ora attivo su **stdio** (compatibile con VS Code Copilot, Claude Desktop, ecc.).

---

## Struttura

```
src/
  index.ts            ← Entry point
  server.ts           ← Crea McpServer e registra tutto
  tools/
    index.ts          ← Registry tool (aggiungi qui)
    echo.ts           ← Tool di esempio — copia come template
  resources/
    index.ts          ← Registry resource
  prompts/
    index.ts          ← Registry prompt template MCP
  utils/
    logger.ts         ← Logger MCP-safe (scrive su stderr)
.vscode/
  mcp.json            ← Server MCP attivi in VS Code (GitHub, GitLab, ecc.)
  settings.json       ← Impostazioni progetto + Copilot
  typescript.instructions.md  ← Convenzioni auto-iniettate in Copilot
  prompts/
    add-tool.prompt.md          ← /add-tool
    add-resource.prompt.md      ← /add-resource
    implement-feature.prompt.md ← /implement-feature
    debug-mcp.prompt.md         ← /debug-mcp
.github/
  copilot-instructions.md  ← Istruzioni globali per Copilot
.env.example          ← Template segreti (non committare .env)
```

---

## Comandi npm

| Comando | Azione |
|---|---|
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run dev` | Watch mode (ricompila automaticamente) |
| `npm start` | Avvia il server compilato |
| `npm run build:start` | Build + avvio in un comando |

---

## Aggiungere un nuovo tool

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

## MCP server integrati

Configurati in `.vscode/mcp.json`:

| Server | Stato | Cosa fa |
|---|---|---|
| `mcp-base-template` | ✅ attivo | Il server locale di questo progetto |
| `github` | ✅ attivo | Repos, issues, PR, branch, commit |
| `gitlab` | ✅ attivo | Repos, MR, pipeline, groups |
| `filesystem` | 💤 commentato | Lettura/scrittura file su disco |
| `memory` | 💤 commentato | Knowledge graph persistente tra sessioni |
| `fetch` | 💤 commentato | Fetch URL, scraping, REST API |
| `sequential-thinking` | 💤 commentato | Ragionamento multi-step strutturato |
| `brave-search` | 💤 commentato | Ricerca web in tempo reale |
| `postgres` | 💤 commentato | Query PostgreSQL |
| `sqlite` | 💤 commentato | Query SQLite locale |
| `puppeteer` | 💤 commentato | Browser automation, screenshot |

Per attivare un server commentato: rimuovi i `//` nel blocco corrispondente in `.vscode/mcp.json`.

---

## Skills e Copilot AI

Tre meccanismi di personalizzazione Copilot, dal più specifico al più generale:

### 1. Prompt riutilizzabili (`.vscode/prompts/*.prompt.md`)
Invocabili con `/nome-file` in chat. Usali per workflow ripetuti.

```
/implement-feature   ← aggiunge una feature rispettando le convenzioni
/add-tool            ← crea un nuovo MCP tool
/add-resource        ← crea una nuova MCP resource
/debug-mcp           ← diagnostica errori nel server MCP
```

### 2. Instructions scoped (`.vscode/*.instructions.md`)
Iniettate **automaticamente** nel contesto Copilot in base al pattern `applyTo`.
`typescript.instructions.md` si attiva su tutti i file `src/**/*.ts`.

### 3. Istruzioni globali (`.github/copilot-instructions.md`)
Sempre attive per qualsiasi conversazione in questo workspace.

---

## Sicurezza

- I token/segreti vanno in `.env` (mai committare)
- VS Code li gestisce anche via `${input:id}` nel `mcp.json` (prompt sicuro una volta a sessione)
- `.gitignore` esclude già `dist/`, `node_modules/`, `.env`

---

## Adattare il template a un nuovo progetto

1. Copia la cartella
2. Rinomina `name` in `package.json` e `server.ts`
3. Svuota / sostituisci i tool in `src/tools/`
4. Attiva/disattiva i server MCP in `.vscode/mcp.json`
5. `npm install && npm run build:start`
