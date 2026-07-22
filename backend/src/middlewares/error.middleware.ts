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
