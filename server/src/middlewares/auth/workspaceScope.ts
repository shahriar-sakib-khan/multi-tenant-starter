import { Request, Response, NextFunction } from 'express';
import { Membership, Workspace } from '@/models';
import { StatusCodes } from 'http-status-codes';
import { assertAuth } from '@/common';

const workspaceScope =
  (allowedRoles: string[] = []) =>
  async (req: Request, res: Response, next: NextFunction) => {
    assertAuth(req);
    const { userId, role } = req.user;
    const { workspaceId } = req.params;

    // Validate required objects exist
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication missing.' });
    }

    // Workspace check
    const workspace = await Workspace.findById(workspaceId).select('workspaceRoles').lean();
    if (!workspace)
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Workspace not found' });

    // SuperAdmin override (ostad)
    if (role === 'ostad') {
      req.membership = {
        user: userId,
        workspace: workspaceId,
        workspaceRoles: workspace.workspaceRoles.map(role => role.name),
      };
      return next();
    }

    // Membership check
    const membership = await Membership.findOne({
      user: userId,
      workspace: workspaceId,
    }).lean();

    if (!membership || membership.status !== 'active') {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Access denied: Not a workspace member' });
    }

    // Assign membership to request object
    req.membership = {
      user: userId,
      workspace: workspaceId,
      workspaceRoles: membership.workspaceRoles,
    };

    // Role validation
    if (allowedRoles.length > 0) {
      const hasWorkspaceRoles = membership.workspaceRoles.some(
        workspaceRoles =>
          allowedRoles.includes(workspaceRoles) || membership.workspaceRoles.includes('admin')
      );
      if (!hasWorkspaceRoles) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: 'Access denied: Insufficient workspace role privileges' });
      }
    }

    next();
  };

export default workspaceScope;
