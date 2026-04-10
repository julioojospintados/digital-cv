import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerEchoTool } from "./echo.js";

/**
 * Central registry for all MCP tools.
 *
 * HOW TO ADD A NEW TOOL:
 * 1. Create a new file in this folder: src/tools/my-tool.ts
 * 2. Export a function `registerMyTool(server: McpServer): void`
 * 3. Import and call it here below.
 */
export function registerAllTools(server: McpServer): void {
  registerEchoTool(server);
  // registerMyTool(server);
}
