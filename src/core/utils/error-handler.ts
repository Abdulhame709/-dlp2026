import { NextResponse } from 'next/server';

export class AppError extends Error {
  public code: string;
  public statusCode: number;
  public details: Record<string, any>;

  constructor(message: string, code = 'INTERNAL_ERROR', statusCode = 500, details: Record<string, any> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: Record<string, any> = {}) {
    super(message, 'VALIDATION_ERROR', 420, details);
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = 'UNAUTHORIZED', statusCode = 401) {
    super(message, code, statusCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied. Insufficient roles or permissions.') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class ErrorHandler {
  /**
   * Translates any error into a standardized JSON API Error response
   */
  static handle(err: any): NextResponse {
    let statusCode = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected server error occurred.';
    let details = {};

    if (err instanceof AppError) {
      statusCode = err.statusCode;
      code = err.code;
      message = err.message;
      details = err.details;
    } else if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json(
      {
        status: 'error',
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
