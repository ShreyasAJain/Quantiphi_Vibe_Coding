import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Known AppError (Operational)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 400, formattedErrors);
    return;
  }

  // 3. Prisma Known Request Errors (e.g. Unique Constraint Violation)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['Field'];
      sendError(
        res,
        `Unique constraint violation: ${target.join(', ')} already exists`,
        409,
        err.meta
      );
      return;
    }

    if (err.code === 'P2025') {
      sendError(res, 'Requested record not found in database', 404);
      return;
    }
  }

  // 4. Unknown / Programmer Errors (Log securely and return 500)
  console.error('💥 Unhandled Error:', err);
  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message,
    500
  );
}
