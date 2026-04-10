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
export function registerAllResources(server: McpServer): void {
  // registerMyResource(server);
}
