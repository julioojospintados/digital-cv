---
name: mcp-architecture
description: "Regole tecniche per il server MCP, Hono, e l'integrazione AI. Carica quando: lavori su src/, aggiungi tool MCP, route HTTP, variabili env, test, data layer, cv.ts, cv.en.ts, risorse MCP, prompt template, logger, Zod, MCP come vantaggio PMI, AI Workflow testi tecnici, build, deploy."
---

# MCP Architecture — Regole Tecniche

## Struttura del Backend

```
src/
  index.ts            ← MCP entry point (stdio) — NO HTTP qui
  http.ts             ← HTTP entry point (Hono) — NO MCP qui
  server.ts           ← McpServer factory
  config/env.ts       ← Zod-validated env vars — unica fonte di verità per config
  data/
    cv.ts             ← CV data IT (source of truth)
    cv.en.ts          ← CV data EN — importa i tipi da cv.ts
  http/
    app.ts            ← Hono app + global error handler + /openapi.json
    errors.ts         ← Typed HTTP error classes (AppError e sottoclassi)
    routes/           ← Un file per feature route
  tools/
    index.ts          ← MCP tool registry
    echo.ts           ← Template tool — copiare come base per nuovi tool
  resources/index.ts  ← MCP resource registry
  prompts/index.ts    ← MCP prompt template registry
  utils/logger.ts     ← Logger stderr-only
```

---

## Regole MCP Fondamentali

- **MAI scrivere su `stdout`** — riservato al JSON-RPC di MCP. Usa `logger` da `src/utils/logger.ts`.
- **Zod** obbligatorio per validare parametri dei tool e variabili env.
- Import locali con estensione `.js` (ES modules NodeNext).
- Non mettere logica HTTP in `src/index.ts` né logica MCP in `src/http.ts`.
- Non committare `.env` — solo `.env.example` è tracciato.

---

## Come Aggiungere un Tool MCP

1. Crea `src/tools/<nome>.ts` copiando `echo.ts`
2. Esporta `register<Nome>Tool(server)`
3. Registra in `src/tools/index.ts`
4. Esegui `npm run build` per verificare

## Come Aggiungere una Route HTTP

1. Crea `src/http/routes/<nome>.ts`, esporta un'istanza `Hono`
2. Monta in `src/http/app.ts`
3. Aggiungi lo schema a `openApiPaths` in `src/http/app.ts`
4. Usa `NotFoundError`, `ValidationError` da `src/http/errors.ts`

## Come Aggiungere Variabili d'Ambiente

1. Dichiara in `src/config/env.ts` (schema Zod)
2. Aggiungi a `.env.example`

---

## Data Layer — Source of Truth

Dettaglio completo (file, sezioni, interfaccia Feedback) in `knolling-cv/SKILL.md`.
Regola da ricordare qui: **ogni modifica a `cv.ts` va rispecchiata in `cv.en.ts`** — non solo la struttura dei tipi, ma anche i contenuti (description, highlights, summary, ecc.). Se cambi una frase in italiano e non tocchi `cv.en.ts`, le due lingue divergono silenziosamente: nessun errore TypeScript te lo segnala, perché i tipi restano compatibili. Aggiorna entrambi i file nella stessa modifica, non "poi".

---

## MCP come Vantaggio Competitivo per PMI

Quando scrivi testi in modalità TECH per AI Workflow / impactScore / card tecniche
(vocabolario base in `knolling-cv/SKILL.md`, qui le varianti tecniche):

**USA:**
- "AI operativa senza assumere un team di data scientist"
- "un sistema che fa lavorare l'AI come un membro del team, H24, a costo fisso"
- "piccole aziende che lo adottano fanno in 2 quello che i competitor fanno in 8"
- "MCP non è per grandi budget. È per chi vuole l'AI che funziona davvero, integrata nei processi,
  non in una sandbox dimostrativa."

**EVITA:**
- "architettura enterprise", "scalabilità cloud-native"
- "tool MCP" (generico) — specifica il vantaggio concreto
- Qualsiasi framing che suoni da Fortune 500

I tag delle card AI devono includere `mcp` oltre a `tech`.
La sezione "AI-Enhanced Workflow" mostra il badge `MCP` come **firma del metodo**.

---

## Comandi Utili

| Comando | Azione |
|---|---|
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run dev` | Watch mode (ricompila automaticamente) |
| `npm start` | Avvia il server compilato |
| `npm run build:start` | Build + avvio in un comando |

---

## Regole per i Test

- **Mai committare test rotti.** Se un test fallisce, correggi prima di pushare.
- I test non modificano i dati di produzione (`cv.ts`, `cv.en.ts`) — li leggono e ne verificano
  l'integrità.
- File `*.test.ts` esclusi dal build output (`dist/`).

| Layer | Tool | Env |
|---|---|---|
| MCP/HTTP (`src/`) | Vitest | Node |
| cv-site logic (stores) | Vitest + jsdom | jsdom |

### Priorità Test (in ordine)
1. Error classes (`src/http/errors.ts`) — costruttori, statusCode, toJSON
2. HTTP routes (`src/http/app.ts`) — health, openapi.json, 404, error handler
3. MCP tools (`src/tools/*.ts`) — registrazione e handler logica
4. CV data integrity (`src/data/cv.ts`) — campi required, formati date, valori enum
5. CV parity EN/IT (`src/data/cv.en.ts`) — stessa struttura dell'italiano
6. modeStore logic (`cv-site/src/islands/stores/modeStore.ts`)

### NON Testare
- Componenti Lit (GoLogo, ModeSwitcher) — dipendono dal browser reale
- Pagine Astro (index.astro, cv.astro) — dipendono dal build Astro
- Animazioni GSAP — impossibili da testare in unit test
