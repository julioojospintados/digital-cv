import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Example tool: echoes back a message.
 * Use this as a template for new tools.
 *
 * COPY THIS FILE → rename → update name/description/schema/handler.
 */
export function registerEchoTool(server: McpServer): void {
  server.tool(
    // Tool name (unique, kebab-case)
    "echo",

    // Description shown to the AI
    "Echoes back the provided message. Useful as a connectivity test.",

    // Input schema (Zod)
    {
      message: z.string().min(1).describe("The message to echo back"),
    },

    // Handler
    async ({ message }) => ({
      content: [
        {
          type: "text",
          text: `Echo: ${message}`,
        },
      ],
    }),
  );
}
