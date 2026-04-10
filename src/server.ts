import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";
import { registerAllPrompts } from "./prompts/index.js";

/**
 * Creates and configures the MCP server.
 * Add/remove capabilities by editing the register* functions
 * in tools/, resources/ and prompts/.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "mcp-base-template",
    version: "1.0.0",
  });

  registerAllTools(server);
  registerAllResources(server);
  registerAllPrompts(server);

  return server;
}
