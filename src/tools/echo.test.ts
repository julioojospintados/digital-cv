import { describe, it, expect, vi } from "vitest";
import { registerEchoTool } from "./echo.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

type ToolHandler = (args: Record<string, string>) => Promise<{
  content: { type: string; text: string }[];
}>;

function createMockServer() {
  const calls: Parameters<McpServer["tool"]>[] = [];
  return {
    tool: vi.fn((...args: Parameters<McpServer["tool"]>) => {
      calls.push(args);
    }),
    calls,
  };
}

describe("registerEchoTool", () => {
  it("registers exactly one tool named 'echo'", () => {
    const server = createMockServer();
    registerEchoTool(server as unknown as McpServer);

    expect(server.tool).toHaveBeenCalledTimes(1);
    const [name] = server.tool.mock.calls[0];
    expect(name).toBe("echo");
  });

  it("includes a non-empty description", () => {
    const server = createMockServer();
    registerEchoTool(server as unknown as McpServer);

    const description = server.tool.mock.calls[0][1] as string;
    expect(typeof description).toBe("string");
    expect(description.length).toBeGreaterThan(0);
  });
});

describe("echo tool handler", () => {
  async function getHandler(): Promise<ToolHandler> {
    const server = createMockServer();
    registerEchoTool(server as unknown as McpServer);
    // The 4th argument (index 3) is the handler function
    return server.tool.mock.calls[0][3] as unknown as ToolHandler;
  }

  it("returns a text content item", async () => {
    const handler = await getHandler();
    const result = await handler({ message: "hello" });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
  });

  it("echoes the message with 'Echo: ' prefix", async () => {
    const handler = await getHandler();
    const result = await handler({ message: "world" });

    expect(result.content[0].text).toBe("Echo: world");
  });

  it("preserves special characters in the message", async () => {
    const handler = await getHandler();
    const result = await handler({ message: "Hello, <World> & co!" });

    expect(result.content[0].text).toBe("Echo: Hello, <World> & co!");
  });

  it("preserves unicode in the message", async () => {
    const handler = await getHandler();
    const result = await handler({ message: "Ciao 🌍" });

    expect(result.content[0].text).toBe("Echo: Ciao 🌍");
  });
});
