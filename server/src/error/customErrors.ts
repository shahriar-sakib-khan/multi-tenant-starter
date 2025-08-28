import { StatusCodes } from 'http-status-codes';

interface CustomErrorPayload {
  errors?: Array<{ field?: string; message: string }>;
  code?: string;
}

export class BaseError extends Error {
  public statusCode: number;
  public errors?: Array<{ field?: string; message: string }>;
  public code?: string;

  constructor(message: string, statusCode: number, payload: CustomErrorPayload = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = payload.errors;
    this.code = payload.code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// If routes don't exist

export class NotFoundError extends BaseError {
  constructor(message = 'Not Found') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

// If something broke inside a valid route

export class BadRequestError extends BaseError {
  constructor(message = 'Bad Request', payload?: CustomErrorPayload) {
    super(message, StatusCodes.BAD_REQUEST, payload);
  }
}

export class UnauthenticatedError extends BaseError {
  constructor(message = 'Unauthenticated') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class ConflictError extends BaseError {
  constructor(message = 'Conflict') {
    super(message, StatusCodes.CONFLICT);
  }
}

export class ServerError extends BaseError {
  constructor(message = 'Internal Server Error') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default {
  BaseError,
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
  UnauthorizedError,
  ConflictError,
  ServerError,
};
