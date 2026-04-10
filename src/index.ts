import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("MCP server started (stdio)");
}

main().catch((err) => {
  logger.error("Fatal error starting MCP server:", err);
  process.exit(1);
});
