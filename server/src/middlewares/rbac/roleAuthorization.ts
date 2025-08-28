import { assertAuth } from '@/common';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Middleware to authorize based on allowed roles.
 * Supports users with multiple roles (roles: [String]).
 */
const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    assertAuth(req);
    const { role } = req.user;
    if (!allowedRoles.includes(role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied' });
    }
    next();
  };
};

export default requireRole;
