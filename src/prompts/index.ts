import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Central registry for all MCP prompt templates.
 *
 * HOW TO ADD A NEW PROMPT:
 * 1. Create src/prompts/my-prompt.ts
 * 2. Export `registerMyPrompt(server: McpServer): void`
 * 3. Import and call it here below.
 *
 * Example prompt registration:
 *
 *   server.prompt(
 *     "prompt-name",
 *     "Description of the prompt",
 *     { topic: z.string().describe("The topic to write about") },
 *     ({ topic }) => ({
 *       messages: [
 *         {
 *           role: "user",
 *           content: { type: "text", text: `Write a summary about: ${topic}` },
 *         },
 *       ],
 *     }),
 *   );
 */
export function registerAllPrompts(server: McpServer): void {
  // registerMyPrompt(server);

  // Kept here as a concrete example — delete when you add real prompts.
  server.prompt(
    "starter",
    "A simple starter prompt to verify the MCP server is working",
    { task: z.string().describe("What you want help with") },
    ({ task }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `You are a helpful assistant. Help me with: ${task}`,
          },
        },
      ],
    }),
  );
}
