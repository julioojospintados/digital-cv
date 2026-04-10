---
mode: agent
description: Implementa una nuova feature rispettando le convenzioni del progetto
---

Stai implementando una nuova feature in questo progetto MCP TypeScript.

## Regole obbligatorie

- **Mai** usare `console.log()` → usa `logger` da `src/utils/logger.ts`
- **Mai** scrivere su stdout (riservato al protocollo MCP)
- Valida sempre gli input con **Zod** nei tool
- Tutti gli import locali devono avere estensione **`.js`** (ES modules NodeNext)
- Aggiungi il tipo di ritorno esplicito alle funzioni esportate pubblicamente
- Dopo ogni modifica esegui `npm run build` per verificare

## Struttura da seguire

| Cosa aggiungi | Dove va il file | Dove si registra |
|---|---|---|
| Tool MCP | `src/tools/<nome>.ts` | `src/tools/index.ts` |
| Resource MCP | `src/resources/<nome>.ts` | `src/resources/index.ts` |
| Prompt template MCP | `src/prompts/<nome>.ts` | `src/prompts/index.ts` |
| Utility condivisa | `src/utils/<nome>.ts` | importata dove serve |

## Feature da implementare

${input:featureDescription}
