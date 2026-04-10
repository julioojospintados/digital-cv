/**
 * Structured HTTP error types.
 *
 * HOW TO USE IN ROUTE HANDLERS:
 *   throw new NotFoundError("User not found")
 *   throw new ValidationError("Invalid input", { field: "email" })
 *
 * HOW TO ADD A NEW ERROR TYPE:
 *   export class MyError extends AppError {
 *     constructor(message: string) {
 *       super(message, <status_code>);
 *     }
 *   }
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON(): Record<string, unknown> {
    return {
      error: this.name,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, 422, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class InternalError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}
