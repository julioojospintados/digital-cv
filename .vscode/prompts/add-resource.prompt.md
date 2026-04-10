---
mode: agent
description: Aggiunge una nuova MCP resource al progetto
---

Aggiungi una nuova MCP resource al progetto:

1. Crea `src/resources/${input:resourceName}.ts`:

```typescript
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function register${input:resourceNamePascal}Resource(server: McpServer): void {
  server.resource(
    "${input:resourceName}",
    "resource://${input:resourceName}",
    { mimeType: "text/plain" },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: "Contenuto della resource",
        },
      ],
    }),
  );
}
```

2. Apri `src/resources/index.ts` e registra la resource.
3. Verifica con `npm run build`.
