---
mode: agent
description: Aggiunge un nuovo MCP tool al progetto in modo modulare
---

Aggiungi un nuovo MCP tool al progetto seguendo queste regole:

1. Crea il file `src/tools/${input:toolName}.ts` usando questo schema:

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function register${input:toolNamePascal}Tool(server: McpServer): void {
  server.tool(
    "${input:toolName}",
    "${input:toolDescription}",
    {
      // Definisci qui i parametri con Zod
    },
    async (params) => ({
      content: [{ type: "text", text: "Risultato qui" }],
    }),
  );
}
```

2. Apri `src/tools/index.ts` e:
   - Aggiungi l'import in cima
   - Chiama la funzione dentro `registerAllTools`

3. Verifica la correttezza con `npm run build`.
