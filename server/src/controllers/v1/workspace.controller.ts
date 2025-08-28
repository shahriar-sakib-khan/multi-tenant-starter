/**
 * @module WorkspaceController
 *
 * @description Controller for workspace CRUD, members, invites, roles, and role assignments.
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { workspaceService, membersService, rolesService, invitesService } from '@/services/v1';
import { assertAuth } from '@/common';

/**
 * ----------------- Workspace CRUD -----------------
 */

/**
 * @function createWorkspace
 * @desc Creates a new workspace.
 * @route POST /api/v1/workspaces
 * @access Private
 */
export const createWorkspace = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;

  const workspace = await workspaceService.createWorkspace(req.body, userId);

  res.status(StatusCodes.CREATED).json({
    message: 'Workspace created successfully',
    workspace,
  });
};

/**
 * @function myWorkspaces
 * @desc Retrieves all workspaces of the current user with pagination.
 * @route GET /api/v1/workspaces/my
 * @access Private
 */
export const myWorkspaces = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { workspaces, total } = await workspaceService.getAllWorkspaces(userId, page, limit);

  res.status(StatusCodes.OK).json({ total, page, limit, workspaces });
};

/**
 * @function singleWorkspace
 * @desc Retrieves a single workspace by ID.
 * @route GET /api/v1/workspaces/:workspaceId
 * @access Public
 */
export const singleWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  const workspace = await workspaceService.getSingleWorkspace(workspaceId);

  res.status(StatusCodes.OK).json({ workspace });
};

/**
 * @function updateWorkspace
 * @desc Updates a workspace by ID.
 * @route PATCH /api/v1/workspaces/:workspaceId
 * @access Private
 */
export const updateWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  const workspace = await workspaceService.updateWorkspace(req.body, workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Workspace updated successfully',
    workspace,
  });
};

/**
 * @function deleteWorkspace
 * @desc Deletes a workspace by ID.
 * @route DELETE /api/v1/workspaces/:workspaceId
 * @access Private
 */
export const deleteWorkspace = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  const workspace = await workspaceService.deleteWorkspace(workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Workspace deleted successfully',
    workspace,
  });
};

/**
 * @function myWorkspaceProfile
 * @desc Retrieves the current user's profile for a workspace.
 * @route GET /api/v1/workspaces/:workspaceId/profile
 * @access Private
 */
export const myWorkspaceProfile = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const { workspaceId } = req.params;

  const workspaceProfile = await workspaceService.getMyWorkspaceProfile(userId, workspaceId);

  res.status(StatusCodes.OK).json({ workspaceProfile });
};

/**
 * ----------------- Workspace Members -----------------
 */

/**
 * @function allMembers
 * @desc Retrieves all members of a workspace with pagination.
 * @route GET /api/v1/workspaces/:workspaceId/members
 * @access Public
 */
export const allMembers = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { members, total } = await membersService.getAllWorkspaceMembers(workspaceId, page, limit);

  res.status(StatusCodes.OK).json({
    total,
    page,
    limit,
    workspaceMembers: members,
  });
};

/**
 * @function getMember
 * @desc Retrieves a single member of a workspace.
 * @route GET /api/v1/workspaces/:workspaceId/members/:memberId
 * @access Public
 */
export const getMember = async (req: Request, res: Response) => {
  const { workspaceId, memberId } = req.params;

  const member = await membersService.getWorkspaceMember(workspaceId, memberId);

  res.status(StatusCodes.OK).json({ member });
};

/**
 * @function removeMember
 * @desc Removes a member from a workspace.
 * @route DELETE /api/v1/workspaces/:workspaceId/members/:memberId
 * @access Private
 */
export const removeMember = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const { workspaceId, memberId } = req.params;

  const member = await membersService.removeWorkspaceMember(userId, workspaceId, memberId);

  res.status(StatusCodes.OK).json({
    message: 'Member removed successfully',
    member,
  });
};

/**
 * ----------------- Workspace Invites -----------------
 */

/**
 * @function sendInvite
 * @desc Sends an invite to join a workspace.
 * @route POST /api/v1/workspaces/:workspaceId/invites
 * @access Private
 */
export const sendInvite = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const { workspace } = req.membership;

  const invite = await invitesService.sendWorkspaceInvite(req.body, userId, workspace);

  res.status(StatusCodes.OK).json({
    message: 'Invite sent successfully',
    invite,
  });
};

/**
 * @function acceptInvite
 * @desc Accepts a workspace invite using a token.
 * @route POST /api/v1/workspaces/invites/:token/accept
 * @access Private
 */
export const acceptInvite = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;

  const invite = await invitesService.acceptWorkspaceInvite(req.params.token, userId);

  res.status(StatusCodes.OK).json({
    message: 'Invite accepted successfully',
    invite,
  });
};

/**
 * @function declineInvite
 * @desc Declines a workspace invite using a token.
 * @route POST /api/v1/workspaces/invites/:token/decline
 * @access Private
 */
export const declineInvite = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const { token } = req.params;

  const invite = await invitesService.declineWorkspaceInvite(token, userId);

  res.status(StatusCodes.OK).json({
    message: 'Invite declined successfully',
    invite,
  });
};

/**
 * @function allInvites
 * @desc Retrieves all invites for the current workspace with pagination.
 * @route GET /api/v1/workspaces/:workspaceId/invites
 * @access Private
 */
export const allInvites = async (req: Request, res: Response) => {
  assertAuth(req);
  const { workspace } = req.membership;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { SanitizedWorkspaceInvites: allInvites, total } = await invitesService.getAllInvites(
    workspace,
    page,
    limit
  );

  res.status(StatusCodes.OK).json({ total, page, limit, allInvites });
};

/**
 * @function deleteInvite
 * @desc Deletes a workspace invite using a token.
 * @route DELETE /api/v1/workspaces/invites/:token
 * @access Private
 */
export const deleteInvite = async (req: Request, res: Response) => {
  assertAuth(req);
  const { token } = req.params;

  const invite = await invitesService.deleteWorkspaceInvite(token);

  res.status(StatusCodes.OK).json({
    message: 'Invitation deleted successfully',
    invite,
  });
};

/**
 * ----------------- Workspace Roles -----------------
 */

/**
 * @function allRoles
 * @desc Retrieves all roles in a workspace.
 * @route GET /api/v1/workspaces/:workspaceId/roles
 * @access Public
 */
export const allRoles = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  const workspaceRoles = await rolesService.getWorkspaceRoles(workspaceId);
  const totalRoles = workspaceRoles.length;

  res.status(StatusCodes.OK).json({ totalRoles, workspaceRoles });
};

/**
 * @function addRole
 * @desc Adds a role to a workspace.
 * @route POST /api/v1/workspaces/:workspaceId/roles
 * @access Private
 */
export const addRole = async (req: Request, res: Response) => {
  const { workspaceId } = req.params;

  const workspaceRoles = await rolesService.addWorkspaceRole(req.body, workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Role added successfully',
    workspaceRoles,
  });
};

/**
 * @function updateRole
 * @desc Updates a role in a workspace.
 * @route PATCH /api/v1/workspaces/:workspaceId/roles/:roleId
 * @access Private
 */
export const updateRole = async (req: Request, res: Response) => {
  const { workspaceId, roleId } = req.params;

  const workspaceRoles = await rolesService.updateWorkspaceRole(req.body, roleId, workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Role updated successfully',
    workspaceRoles,
  });
};

/**
 * @function removeRole
 * @desc Removes a role from a workspace.
 * @route DELETE /api/v1/workspaces/:workspaceId/roles/:roleId
 * @access Private
 */
export const removeRole = async (req: Request, res: Response) => {
  const { workspaceId, roleId } = req.params;

  const workspaceRoles = await rolesService.removeWorkspaceRole(roleId, workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Role removed successfully',
    workspaceRoles,
  });
};

/**
 * ----------------- Role Assignment (workspace) -----------------
 */

/**
 * @function assignRole
 * @desc Assigns a role to a user in a workspace.
 * @route POST /api/v1/workspaces/:workspaceId/roles/:roleId/assign/:userId
 * @access Private
 */
export const assignRole = async (req: Request, res: Response) => {
  const { userId, roleId, workspaceId } = req.params;

  const membership = await rolesService.assignRoleToUser(userId, roleId, workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Role assigned successfully',
    membership,
  });
};

/**
 * @function unassignRole
 * @desc Removes a role assignment from a user in a workspace.
 * @route POST /api/v1/workspaces/:workspaceId/roles/:roleId/unassign/:userId
 * @access Private
 */
export const unassignRole = async (req: Request, res: Response) => {
  const { userId, roleId, workspaceId } = req.params;

  const membership = await rolesService.unassignRoleFromUser(userId, roleId, workspaceId);

  res.status(StatusCodes.OK).json({
    message: 'Role unassigned successfully',
    membership,
  });
};

/**
 * ----------------- Default export (workspace controllers) -----------------
 */
export default {
  // Workspace CRUD
  createWorkspace, // Create a new workspace
  myWorkspaces, // Get all workspaces for the current user
  singleWorkspace, // Get a single workspace by ID
  updateWorkspace, // Update a workspace
  deleteWorkspace, // Delete a workspace
  myWorkspaceProfile, // Get the profile of the current user's workspace

  // Workspace Members
  allMembers, // Get all members of a workspace
  getMember, // Get a single workspace member
  removeMember, // Remove a member from a workspace

  // Workspace Invites
  sendInvite, // Send an invite to join a workspace
  acceptInvite, // Accept a workspace invite
  declineInvite, // Decline a workspace invite
  allInvites, // Get all workspace invites
  deleteInvite, // Delete a workspace invite

  // Workspace Roles
  allRoles, // Get all roles in a workspace
  addRole, // Add a new role to a workspace
  updateRole, // Update a role in a workspace
  removeRole, // Remove a role from a workspace

  // Role Assignment (workspace)
  assignRole, // Assign a role to a user in a workspace
  unassignRole, // Remove a role assignment from a user
};
