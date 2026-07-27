import type { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../utils/http-status.enum";
import { AppError } from "../utils/errors";

export const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err && typeof err === "object" && (err as any).name === "ValidationError") {
    statusCode = HttpStatus.BAD_REQUEST;
    message = Object.values((err as any).errors || {})
      .map((val: any) => val.message)
      .join(", ") || "Validation error";
  } else if (err && typeof err === "object" && (err as any).name === "CastError") {
    statusCode = HttpStatus.BAD_REQUEST;
    message = `Invalid ${(err as any).path || "value"}: ${(err as any).value || ""}`;
  } else if (err && typeof err === "object" && (err as any).code === 11000) {
    statusCode = HttpStatus.CONFLICT;
    const field = Object.keys((err as any).keyValue || {})[0] || "field";
    message = `Duplicate field value entered for ${field}.`;
  } else if (err && typeof err === "object" && (err as any).name === "TokenExpiredError") {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = "Token expired";
  } else if (err && typeof err === "object" && (err as any).name === "JsonWebTokenError") {
    statusCode = HttpStatus.UNAUTHORIZED;
    message = "Invalid token";
  } else if (err instanceof Error) {
    const rawError = err as Error & { statusCode?: number };
    if (typeof rawError.statusCode === 'number') {
      statusCode = rawError.statusCode;
    }
    message = err.message;
  } else if (typeof err === "object" && err !== null) {
    const rawError = err as { statusCode?: unknown; message?: unknown };
    if (typeof rawError.statusCode === "number") {
      statusCode = rawError.statusCode;
    }
    if (typeof rawError.message === "string") {
      message = rawError.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && err instanceof Error && { stack: err.stack }),
  });
};
