import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Central registry for all MCP resources.
 *
 * HOW TO ADD A NEW RESOURCE:
 * 1. Create src/resources/my-resource.ts
 * 2. Export `registerMyResource(server: McpServer): void`
 * 3. Import and call it here below.
 *
 * Example resource registration:
 *
 *   server.resource(
 *     "resource-name",
 *     "resource://my-resource",
 *     { mimeType: "text/plain" },
 *     async (uri) => ({
 *       contents: [{ uri: uri.href, text: "Resource content here" }],
 *     }),
 *   );
 */
// `server` non è ancora usato perché il registry è vuoto: nessuna resource
// è registrata oggi. Il parametro resta nella firma — è l'API che ogni
// register*Resource() riceverà — quindi si disattiva la regola qui invece di
// rinominarlo `_server`, che andrebbe rinominato di nuovo al primo uso.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerAllResources(server: McpServer): void {
  // registerMyResource(server);
}
