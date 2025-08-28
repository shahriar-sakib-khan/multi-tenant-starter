import { Request, Response, NextFunction } from 'express';

import { Errors } from '@/error';
import { Tokens } from '@/utils';
import { assertAuth } from '@/common';

/**
 * Middleware to authenticate user from JWT access token (cookie or header).
 * Adds decoded user info to req.user and ensures type safety.
 */
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    throw new Errors.UnauthenticatedError('Authentication token required');
  }

  const { userId, role } = Tokens.verifyAccessToken(accessToken);

  req.user = { userId, role };

  // Type assertion to narrow req.user
  assertAuth(req);

  next();
};

export default requireAuth;
