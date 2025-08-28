import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { Errors } from '@/error/index';

/**
 * Global Express error handling middleware.
 * Handles:
 * - Validation errors (Zod)
 * - Custom application errors (BaseError)
 * - Unknown/unexpected errors
 *
 * @param {unknown} err - Error thrown in request pipeline
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Response} JSON error response
 */
const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): Response => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) console.error('🔥 Error:', err);

  // Handle validation errors from Zod
  if (err instanceof ZodError) {
    const errors = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors,
      errorType: 'ValidationError',
    });
  }

  // Handle custom application errors
  if (err instanceof Errors.BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      errorType: err.name,
      code: err.code,
    });
  }

  // Handle unexpected unknown errors
  const genericMessage = (err as Error)?.message || 'Something went wrong, please try again later.';
  const errorType = (err as Error)?.name || 'InternalServerError';
  const stack = (err as Error)?.stack;

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: genericMessage,
    errorType,
    stack: isProduction ? undefined : stack,
  });
};

export default errorHandler;
