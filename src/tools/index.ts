import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerEchoTool } from "./echo.js";
import { registerCvRecruiterTool } from "./cv-recruiter.js";
import { registerCvApplicationsListTool } from "./cv-applications-list.js";
import { registerCvApplicationsUpdateTool } from "./cv-applications-update.js";

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
  registerCvRecruiterTool(server);
  registerCvApplicationsListTool(server);
  registerCvApplicationsUpdateTool(server);
}
