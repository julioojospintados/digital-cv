---
mode: agent
description: Fa il debug di un errore nel server MCP
---

Analizza e correggi il problema descritto nel server MCP TypeScript.

## Checklist diagnostica

1. **stdout contaminato?** — Cerca `console.log` nel codice; sostituisci con `logger.error/warn`
2. **Errore di build?** — Esegui `npm run build` e leggi l'output
3. **Schema Zod non valido?** — Controlla che i tipi Zod corrispondano ai tipi TypeScript attesi
4. **Import mancante `.js`?** — Tutti gli import locali richiedono l'estensione `.js` in modalità NodeNext
5. **Tool non registrato?** — Verifica che il tool sia chiamato in `src/tools/index.ts`

## Problema da risolvere

${input:problemDescription}
