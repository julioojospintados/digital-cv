# MCP Base Template — Copilot Instructions

## Informazioni utente

- **GitHub username**: `julioojospintados`

---

## Comportamento Copilot — domande extra-progetto

Quando l'utente fa una domanda **non direttamente legata al codice o al progetto corrente**
(es. domande generali, ricerche, analisi, decisioni, confronti), chiedi **prima di rispondere**:

> "Vuoi che usi:
> - 🔍 **Brave Search** — per cercare informazioni aggiornate online e
> - 🧠 **Sequential Thinking** — per ragionare la risposta in modo strutturato step-by-step?
> - Sì / Solo Brave o solo Sequential Thinking/SQ?"

Poi agisci in base alla risposta. Se l'utente dice "Sì", usa prima Sequential Thinking per strutturare il ragionamento e poi Brave Search per i dati aggiornati.
Altrimenti usa solo Sequential Thinking o solo Brave Search a seconda della preferenza espressa.

**Non fare questa domanda** per operazioni di codice, build, file, git o MCP — in quel caso procedi direttamente.

---

Questo è un progetto **template riutilizzabile** per server MCP (Model Context Protocol) scritto in TypeScript.

## Struttura del progetto

```
src/
  index.ts          ← Entry point (avvio server + transport stdio)
  server.ts         ← Creazione McpServer e orchestrazione
  tools/
    index.ts        ← Registry: qui si registrano tutti i tool
    echo.ts         ← Esempio: template per nuovi tool
  resources/
    index.ts        ← Registry: qui si registrano tutte le resource
  prompts/
    index.ts        ← Registry: qui si registrano tutti i prompt template
.vscode/
  mcp.json          ← Config MCP per VS Code/Copilot
  prompts/          ← Prompt .md riutilizzabili (usali con /nomeprompt)
.github/
  copilot-instructions.md  ← Questo file
```

## Convenzioni

- **Tool**: ogni tool sta in `src/tools/<nome>.ts`, esporta `register<Nome>Tool(server)`.
- **Resource**: ogni resource sta in `src/resources/<nome>.ts`, esporta `register<Nome>Resource(server)`.
- **Prompt**: ogni prompt template sta in `src/prompts/<nome>.ts`, esporta `register<Nome>Prompt(server)`.
- Dopo aver creato il file, registralo sempre nell'`index.ts` della cartella corrispondente.
- Usa sempre Zod per validare i parametri dei tool.
- Tutti gli import di moduli locali devono avere l'estensione `.js` (ES modules con NodeNext).

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
