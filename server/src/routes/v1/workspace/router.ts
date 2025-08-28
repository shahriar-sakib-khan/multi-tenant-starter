import { Router } from 'express';

import { validateRequest, workspaceValidator, workspaceScope } from '@/middlewares';
import { workspaceController } from '@/controllers/v1';
import divisionRouter from './division/division.router';

/**
 * @swagger
 * tags:
 *   - name: Workspace
 *     description: Workspace creation, management, member handling, roles, and invites for multi-tenant environment
 */

const router = Router();

/**
 * ----------------- Workspace CRUD -----------------
 */

/**
 * @route   POST /workspace
 * @desc    Create a new workspace
 * @access  Authenticated
 */
router.post(
  '/',
  validateRequest(workspaceValidator.workspaceSchema),
  workspaceController.createWorkspace
);

/**
 * @route   GET /workspace/mine
 * @desc    Get all workspaces owned or joined by the user
 * @access  Authenticated
 */
router.get('/mine', workspaceController.myWorkspaces);

/**
 * @route   GET /workspace/:workspaceId
 * @desc    Get single workspace by ID
 * @access  Admin
 */
router.get('/:workspaceId', workspaceScope(['admin']), workspaceController.singleWorkspace);

/**
 * @route   PUT /workspace/:workspaceId
 * @desc    Update workspace details
 * @access  Admin
 */
router.put(
  '/:workspaceId',
  validateRequest(workspaceValidator.workspaceSchema),
  workspaceScope(['admin']),
  workspaceController.updateWorkspace
);

/**
 * @route   DELETE /workspace/:workspaceId
 * @desc    Delete a workspace
 * @access  Admin
 */
router.delete('/:workspaceId', workspaceScope(['admin']), workspaceController.deleteWorkspace);

/**
 * @route   GET /workspace/:workspaceId/profile
 * @desc    Get current user’s profile in a workspace (roles, permissions)
 * @access  Authenticated (member)
 */
router.get('/:workspaceId/profile', workspaceScope(), workspaceController.myWorkspaceProfile);

/**
 * ----------------- Workspace Member  -----------------
 */

/**
 * @route   GET /workspace/:workspaceId/members
 * @desc    Get all members in a workspace
 * @access  Member/Admin
 */
router.get('/:workspaceId/members', workspaceScope(), workspaceController.allMembers);

/**
 * @route   GET /workspace/:workspaceId/members/:memberId
 * @desc    Get a single member in a workspace
 * @access  Admin
 */
router.get(
  '/:workspaceId/members/:memberId',
  workspaceScope(['admin']),
  workspaceController.getMember
);

/**
 * @route   DELETE /workspace/:workspaceId/members/:memberId
 * @desc    Remove a member from the workspace
 * @access  Admin
 */
router.delete(
  '/:workspaceId/members/:memberId',
  workspaceScope(['admin']),
  workspaceController.removeMember
);

/**
 * ----------------- Workspace Invite  -----------------
 */

/**
 * @route   POST /workspace/:workspaceId/invites/send
 * @desc    Send a workspace invite to a user
 * @access  Admin
 */
router.post(
  '/:workspaceId/invites/send',
  workspaceScope(['admin']),
  validateRequest(workspaceValidator.inviteSchema),
  workspaceController.sendInvite
);

/**
 * @route   GET /workspace/:workspaceId/invites
 * @desc    Get all invites sent for a workspace
 * @access  Admin
 */
router.get('/:workspaceId/invites', workspaceScope(['admin']), workspaceController.allInvites);

/**
 * @route   PUT /workspace/invites/:token/accept
 * @desc    Accept a workspace invite
 * @access  Public (via token)
 */
router.put('/invites/:token/accept', workspaceController.acceptInvite);

/**
 * @route   PUT /workspace/invites/:token/decline
 * @desc    Decline a workspace invite
 * @access  Public (via token)
 */
router.put('/invites/:token/decline', workspaceController.declineInvite);

/**
 * @route   DELETE /workspace/:workspaceId/invites/:token
 * @desc    Delete a sent invite from a workspace
 * @access  Admin
 */
router.delete(
  '/:workspaceId/invites/:token',
  workspaceScope(['admin']),
  workspaceController.deleteInvite
);

/**
 * ----------------- Workspace Role  -----------------
 */

/**
 * @route   GET /workspace/:workspaceId/roles
 * @desc    Get all custom roles in a workspace
 * @access  Admin
 */
router.get('/:workspaceId/roles', workspaceScope(['admin']), workspaceController.allRoles);

/**
 * @route   POST /workspace/:workspaceId/roles
 * @desc    Add a new custom role to the workspace
 * @access  Admin
 */
router.post(
  '/:workspaceId/roles',
  workspaceScope(['admin']),
  validateRequest(workspaceValidator.roleSchema),
  workspaceController.addRole
);

/**
 * @route   PUT /workspace/:workspaceId/roles/:roleId
 * @desc    Update a custom role in the workspace
 * @access  Admin
 */
router.put(
  '/:workspaceId/roles/:roleId',
  workspaceScope(['admin']),
  validateRequest(workspaceValidator.roleSchema),
  workspaceController.updateRole
);

/**
 * @route   DELETE /workspace/:workspaceId/roles/:roleId
 * @desc    Delete a custom role from the workspace
 * @access  Admin
 */
router.delete(
  '/:workspaceId/roles/:roleId',
  workspaceScope(['admin']),
  workspaceController.removeRole
);

/**
 * ----------------- Role Assignment  -----------------
 */

/**
 * @route   POST /workspace/:workspaceId/roles/:userId/assign/:roleId
 * @desc    Assign a custom role to a user in the workspace
 * @access  Admin
 */
router.post(
  '/:workspaceId/roles/:userId/assign/:roleId',
  workspaceScope(['admin']),
  workspaceController.assignRole
);

/**
 * @route   DELETE /workspace/:workspaceId/roles/:userId/unassign/:roleId
 * @desc    Unassign a custom role from a user in the workspace
 * @access  Admin
 */
router.delete(
  '/:workspaceId/roles/:userId/unassign/:roleId',
  workspaceScope(['admin']),
  workspaceController.unassignRole
);

/**
 * ----------------- Workspace Sub-Routes -----------------
 */

/**
 * @route   api/v1/workspace/:workspaceId/divisions
 * @desc    Division routes nested under workspace
 * @access  All (Belongs to workspace)
 */
router.use('/:workspaceId/divisions', workspaceScope(), divisionRouter);

export default router;
