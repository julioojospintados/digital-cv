import { describe, it, expect } from "vitest";
import { createApp } from "../http/app.js";

/**
 * Template test for the HTTP app.
 * Copy this file and adapt it for each new route you add.
 *
 * HOW TO ADD TESTS:
 * 1. Create src/<module>/<name>.test.ts
 * 2. Import the unit under test
 * 3. Use describe/it/expect from "vitest"
 */
describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const app = createApp();
    const res = await app.request("/health");

    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");
  });
});
