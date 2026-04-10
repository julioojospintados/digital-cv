/**
 * MCP-safe logger — writes exclusively to stderr.
 * stdout is reserved for the MCP JSON-RPC protocol: never use console.log().
 *
 * Set MCP_DEBUG=1 in the environment (or .env) to enable debug output.
 */

const PREFIX = "[mcp]";

export const logger = {
  info(msg: string, ...args: unknown[]): void {
    console.error(`${PREFIX} [INFO]  ${msg}`, ...args);
  },
  warn(msg: string, ...args: unknown[]): void {
    console.error(`${PREFIX} [WARN]  ${msg}`, ...args);
  },
  error(msg: string, ...args: unknown[]): void {
    console.error(`${PREFIX} [ERROR] ${msg}`, ...args);
  },
  debug(msg: string, ...args: unknown[]): void {
    if (process.env["MCP_DEBUG"] === "1") {
      console.error(`${PREFIX} [DEBUG] ${msg}`, ...args);
    }
  },
};
