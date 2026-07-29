import { describe, it, expect } from "vitest";
import { createApp } from "../http/app.js";
import { AppError } from "../http/errors.js";

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

  it("timestamp is a valid ISO date string", async () => {
    const app = createApp();
    const res = await app.request("/health");
    const body = (await res.json()) as { status: string; timestamp: string };
    expect(() => new Date(body.timestamp)).not.toThrow();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });
});

describe("GET /openapi.json", () => {
  it("returns 200 with openapi field", async () => {
    const app = createApp();
    const res = await app.request("/openapi.json");

    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      openapi: string;
      info: { title: string; version: string };
      paths: Record<string, unknown>;
    };
    expect(body.openapi).toBe("3.1.0");
    expect(typeof body.info.title).toBe("string");
    expect(typeof body.info.version).toBe("string");
  });

  it("includes the /health path schema", async () => {
    const app = createApp();
    const res = await app.request("/openapi.json");
    const body = (await res.json()) as { paths: Record<string, unknown> };
    expect(body.paths).toHaveProperty("/health");
  });
});

describe("Unknown routes", () => {
  it("returns 404 for unknown GET route", async () => {
    const app = createApp();
    const res = await app.request("/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("Global error handler", () => {
  it("returns structured JSON for AppError subclasses", async () => {
    const app = createApp();
    app.get("/_test_error", () => {
      throw new AppError("Test error", 418, { hint: "teapot" });
    });

    const res = await app.request("/_test_error");
    expect(res.status).toBe(418);

    const body = (await res.json()) as {
      error: string;
      message: string;
      details: unknown;
    };
    expect(body.error).toBe("AppError");
    expect(body.message).toBe("Test error");
    expect(body.details).toEqual({ hint: "teapot" });
  });

  it("returns 500 InternalError for unexpected throws", async () => {
    const app = createApp();
    app.get("/_test_throw", () => {
      throw new Error("Unexpected crash");
    });

    const res = await app.request("/_test_throw");
    expect(res.status).toBe(500);

    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("InternalError");
  });
});
