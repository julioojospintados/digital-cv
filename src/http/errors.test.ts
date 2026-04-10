import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  InternalError,
} from "./errors.js";

describe("AppError", () => {
  it("is an instance of Error", () => {
    expect(new AppError("msg", 418)).toBeInstanceOf(Error);
  });

  it("sets message and statusCode", () => {
    const e = new AppError("Test error", 418);
    expect(e.message).toBe("Test error");
    expect(e.statusCode).toBe(418);
  });

  it("sets name to constructor name", () => {
    expect(new AppError("x", 400).name).toBe("AppError");
    expect(new NotFoundError().name).toBe("NotFoundError");
  });

  it("toJSON omits details when not provided", () => {
    const json = new AppError("Boom", 500).toJSON();
    expect(json).toEqual({ error: "AppError", message: "Boom" });
    expect("details" in json).toBe(false);
  });

  it("toJSON includes details when provided", () => {
    const json = new AppError("Boom", 422, { field: "email" }).toJSON();
    expect(json).toEqual({
      error: "AppError",
      message: "Boom",
      details: { field: "email" },
    });
  });

  it("toJSON includes details when details is null", () => {
    const json = new AppError("Boom", 422, null).toJSON();
    expect(json.details).toBeNull();
  });
});

describe("NotFoundError", () => {
  it("defaults to 404 with 'Not found' message", () => {
    const e = new NotFoundError();
    expect(e.statusCode).toBe(404);
    expect(e.message).toBe("Not found");
  });

  it("accepts a custom message", () => {
    expect(new NotFoundError("User not found").message).toBe("User not found");
  });

  it("is an instance of AppError", () => {
    expect(new NotFoundError()).toBeInstanceOf(AppError);
  });
});

describe("ValidationError", () => {
  it("defaults to 422 with 'Validation failed' message", () => {
    const e = new ValidationError();
    expect(e.statusCode).toBe(422);
    expect(e.message).toBe("Validation failed");
  });

  it("includes details in toJSON", () => {
    const e = new ValidationError("Bad input", { field: "name" });
    expect(e.toJSON().details).toEqual({ field: "name" });
  });

  it("is an instance of AppError", () => {
    expect(new ValidationError()).toBeInstanceOf(AppError);
  });
});

describe("UnauthorizedError", () => {
  it("defaults to 401", () => {
    const e = new UnauthorizedError();
    expect(e.statusCode).toBe(401);
    expect(e.message).toBe("Unauthorized");
  });

  it("accepts a custom message", () => {
    expect(new UnauthorizedError("Token expired").message).toBe("Token expired");
  });
});

describe("ForbiddenError", () => {
  it("defaults to 403", () => {
    const e = new ForbiddenError();
    expect(e.statusCode).toBe(403);
    expect(e.message).toBe("Forbidden");
  });
});

describe("InternalError", () => {
  it("defaults to 500", () => {
    const e = new InternalError();
    expect(e.statusCode).toBe(500);
    expect(e.message).toBe("Internal server error");
  });
});
