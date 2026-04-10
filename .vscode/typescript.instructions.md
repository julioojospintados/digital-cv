---
applyTo: "src/**/*.ts"
---

# Coding conventions — MCP Base Template

## Regole TypeScript

- Usa `import type` quando importi solo tipi
- Tutti gli import di moduli locali hanno estensione `.js` (NodeNext ES modules)
- Aggiungi tipo di ritorno esplicito alle funzioni pubbliche esportate
- Preferisci `const` a `let`; evita `var`

## Regole MCP

- **Non scrivere mai su stdout** — è riservato al protocollo JSON-RPC
- Per logging usa sempre `logger` da `src/utils/logger.ts`
- Ogni tool deve validare i parametri con **Zod**
- I nomi dei tool usano `kebab-case`; i nomi delle funzioni `camelCase`

## Struttura moduli

- Un tool per file in `src/tools/`; esporta `register<Nome>Tool(server)`
- Una resource per file in `src/resources/`; esporta `register<Nome>Resource(server)`
- Utility condivise in `src/utils/`
- Registra sempre la nuova entità nel corrispondente `index.ts`
