import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Division, DivisionMembership } from '@/models';
import { assertAuth } from '@/common';

const divisionScope = (allowedRoles: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    assertAuth(req);
    const { userId, role } = req.user;
    const { workspaceId, divisionId } = req.params;
    const { user } = req.membership;

    // Validate required objects exist
    if (!req.user || !req.membership || userId !== user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Authentication or membership missing.' });
    }

    // Division check
    const division = await Division.findById(divisionId).select('workspace divisionRoles').lean();
    if (!division) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Division not found' });
    if (division.workspace.toString() !== workspaceId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid request' });
    }

    // SuperAdmin override (ostad)
    if (role === 'ostad') {
      req.divMembership = {
        user: userId,
        division: divisionId,
        divisionRoles: division.divisionRoles.map(role => role.name),
      };
      return next();
    }
    // Division membership check
    const divisionMembership = await DivisionMembership.findOne({
      user: userId,
      division: divisionId,
    }).lean();
    if (!divisionMembership || divisionMembership.status !== 'active') {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Access denied: Not a division member' });
    }

    // Assign division-membership to request object
    req.divMembership = {
      userId,
      division: divisionId,
      divisionRoles: divisionMembership.divisionRoles,
    };

    // Role validation
    if (allowedRoles.length > 0) {
      const hasDivisionRoles = divisionMembership.divisionRoles.some(
        divisionRole =>
          allowedRoles.includes(divisionRole) || divisionMembership.divisionRoles.includes('admin')
      );
      if (!hasDivisionRoles) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'Access denied: Insufficient division role privileges' });
      }
    }

    next();
  };
};

export default divisionScope;
