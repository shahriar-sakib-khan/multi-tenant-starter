import { Request, Response, NextFunction } from 'express';

import { Errors } from '@/error';
import { assertAuth } from '@/common';
import { authService } from '@/services/v1';

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const rawAuthHeader = req.headers.authorization;
  const accessToken = req.cookies?.accessToken || (rawAuthHeader ? rawAuthHeader.split(' ')[1] : null);

  if (!accessToken) {
    throw new Errors.UnauthenticatedError('Authentication token required');
  }

  const { userId, role } = authService.verifyAccessToken(accessToken);

  req.user = { userId, role };
  assertAuth(req);

  next();
};

export default requireAuth;
