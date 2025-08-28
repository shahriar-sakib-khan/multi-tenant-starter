/**
 * @module DivisionController
 *
 * @description Controller for division related operations.
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { divisionService, divisionMembersService, divisionRolesService } from '@/services/v1';
import { assertAuth } from '@/common';

/**
 * ----------------- Division CRUD -----------------
 */

/**
 * @function createDivision
 * @desc Creates a new division in a workspace.
 * @route POST /api/v1/workspaces/:workspaceId/divisions
 * @access Private
 */
export const createDivision = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const { workspaceId } = req.params;

  const division = await divisionService.createDivision(req.body, userId, workspaceId);

  //=============================================
  // Run division creation hooks here
  //=============================================

  res.status(StatusCodes.CREATED).json({ message: 'Division created successfully', division });
};

/**
 * @function singleDivision
 * @desc Retrieves a single division by ID.
 * @route GET /api/v1/workspaces/:workspaceId/divisions/:divisionId
 * @access Public
 */
export const singleDivision = async (req: Request, res: Response) => {
  const { workspaceId, divisionId } = req.params;

  const division = await divisionService.getSingleDivision(workspaceId, divisionId);

  res.status(StatusCodes.OK).json({ division });
};

/**
 * @function updateDivision
 * @desc Updates a division's details.
 * @route PATCH /api/v1/divisions/:divisionId
 * @access Private
 */
export const updateDivision = async (req: Request, res: Response) => {
  const { divisionId } = req.params;

  const division = await divisionService.updateDivision(req.body, divisionId);

  res.status(StatusCodes.OK).json({ message: 'Division updated successfully', division });
};

/**
 * @function deleteDivision
 * @desc Deletes a division by ID.
 * @route DELETE /api/v1/divisions/:divisionId
 * @access Private
 */
export const deleteDivision = async (req: Request, res: Response) => {
  const { divisionId } = req.params;

  const division = await divisionService.deleteDivision(divisionId);

  res.status(StatusCodes.OK).json({ message: 'Division deleted successfully', division });
};

/**
 * @function allDivisions
 * @desc Retrieves all divisions in a workspace with pagination.
 * @route GET /api/v1/workspaces/:workspaceId/divisions
 * @access Public
 */
export const allDivisions = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { workspaceId } = req.params;

  const { divisions, total } = await divisionService.getAllDivisions(workspaceId, page, limit);

  res.status(StatusCodes.OK).json({ total, page, limit, divisions });
};

/**
 * @function myDivisionProfile
 * @desc Retrieves the profile of the current user's division.
 * @route GET /api/v1/workspaces/:workspaceId/divisions/:divisionId/profile
 * @access Private
 */
export const myDivisionProfile = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;
  const { workspaceId, divisionId } = req.params;

  const divisionProfile = await divisionService.getMyDivisionProfile(
    userId,
    divisionId,
    workspaceId
  );

  res.status(StatusCodes.OK).json({ divisionProfile });
};

/**
 * ----------------- Division Members -----------------
 */

/**
 * @function allMembers
 * @desc Retrieves all members of a division with pagination.
 * @route GET /api/v1/workspaces/:workspaceId/divisions/:divisionId/members
 * @access Public
 */
export const allMembers = async (req: Request, res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const { divisionId, workspaceId } = req.params;

  const { members, total } = await divisionMembersService.getAllDivisionMembers(
    divisionId,
    workspaceId,
    page,
    limit
  );

  res.status(StatusCodes.OK).json({ total, page, limit, members });
};

/**
 * @function getMember
 * @desc Retrieves a single member of a division by ID.
 * @route GET /api/v1/workspaces/:workspaceId/divisions/:divisionId/members/:memberId
 * @access Public
 */
export const getMember = async (req: Request, res: Response) => {
  const { memberId, divisionId, workspaceId } = req.params;

  const member = await divisionMembersService.getSingleDivisionMember(
    memberId,
    divisionId,
    workspaceId
  );

  res.status(StatusCodes.OK).json({ member });
};

/**
 * @function addMember
 * @desc Adds a member to a division.
 * @route POST /api/v1/workspaces/:workspaceId/divisions/:divisionId/members
 * @access Private
 */
export const addMember = async (req: Request, res: Response) => {
  assertAuth(req);

  const { userId } = req.user;
  const { workspaceId, divisionId } = req.params;
  const { memberIdentifier } = req.body;

  const member = await divisionMembersService.addMemberToDivision(
    memberIdentifier,
    workspaceId,
    divisionId,
    userId
  );

  res.status(StatusCodes.CREATED).json({ message: 'Member added successfully', member });
};

/**
 * @function removeMember
 * @desc Removes a member from a division.
 * @route DELETE /api/v1/workspaces/:workspaceId/divisions/:divisionId/members
 * @access Private
 */
export const removeMember = async (req: Request, res: Response) => {
  const { workspaceId, divisionId } = req.params;
  const { memberIdentifier } = req.body;

  const member = await divisionMembersService.removeMemberFromDivision(
    memberIdentifier,
    workspaceId,
    divisionId
  );

  res.status(StatusCodes.OK).json({ message: 'Member removed successfully', member });
};

/**
 * ----------------- Division Roles -----------------
 */

/**
 * @function getRoles
 * @desc Retrieves all roles of a division.
 * @route GET /api/v1/divisions/:divisionId/roles
 * @access Public
 */
export const getRoles = async (req: Request, res: Response) => {
  const { divisionId } = req.params;

  const roles = await divisionRolesService.getDivisionRoles(divisionId);
  const total = roles.length;

  res.status(StatusCodes.OK).json({ total, roles });
};

/**
 * @function addRole
 * @desc Adds a role to a division.
 * @route POST /api/v1/divisions/:divisionId/roles
 * @access Private
 */
export const addRole = async (req: Request, res: Response) => {
  const { divisionId } = req.params;

  const divisionRoles = await divisionRolesService.addRoleToDivision(req.body, divisionId);
  const total = divisionRoles.length;

  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Role added successfully', total, divisionRoles });
};

/**
 * @function updateRole
 * @desc Updates a role in a division.
 * @route PATCH /api/v1/divisions/:divisionId/roles/:roleId
 * @access Private
 */
export const updateRole = async (req: Request, res: Response) => {
  const { roleId, divisionId } = req.params;
  const { roleToUpdate, divisionRoles } = await divisionRolesService.updateRoleInDivision(
    req.body,
    roleId,
    divisionId
  );

  const total = divisionRoles.length;

  res.status(StatusCodes.OK).json({
    message: `Role '${roleToUpdate.name}' was updated successfully`,
    total,
    divisionRoles,
  });
};

/**
 * @function removeRole
 * @desc Removes a role from a division.
 * @route DELETE /api/v1/divisions/:divisionId/roles/:roleId
 * @access Private
 */
export const removeRole = async (req: Request, res: Response) => {
  const { roleId, divisionId } = req.params;
  const { roleToRemove, divisionRoles } = await divisionRolesService.removeRoleFromDivision(
    roleId,
    divisionId
  );

  const totalDivisionRoles = divisionRoles.length;

  res.status(StatusCodes.OK).json({
    message: `Role '${roleToRemove.name}' was removed successfully`,
    totalDivisionRoles,
    divisionRoles,
  });
};

/**
 * ----------------- Role Assignment (division) -----------------
 */

/**
 * @function assignRole
 * @desc Assigns a role to a division member.
 * @route POST /api/v1/workspaces/:workspaceId/divisions/:divisionId/roles/:roleId/assign/:userId
 * @access Private
 */
export const assignRole = async (req: Request, res: Response) => {
  const { roleId, userId, workspaceId, divisionId } = req.params;

  const divisionMember = await divisionRolesService.assignRoleToUser(
    roleId,
    userId,
    divisionId,
    workspaceId
  );

  res.status(StatusCodes.CREATED).json({ message: 'Role assigned successfully', divisionMember });
};

/**
 * @function unassignRole
 * @desc Removes a role from a division member.
 * @route DELETE /api/v1/workspaces/:workspaceId/divisions/:divisionId/roles/:roleId/unassign/:userId
 * @access Private
 */
export const unassignRole = async (req: Request, res: Response) => {
  const { roleId, userId, workspaceId, divisionId } = req.params;

  const divisionMember = await divisionRolesService.unassignRoleFromUser(
    roleId,
    userId,
    divisionId,
    workspaceId
  );

  res.status(StatusCodes.OK).json({ message: 'Role unassigned successfully', divisionMember });
};

/**
 * ----------------- Default export (division controllers) -----------------
 */
export default {
  // General
  createDivision, // Create a new division
  singleDivision, // Get a single division by ID
  updateDivision, // Update a division
  deleteDivision, // Delete a division
  allDivisions, // Get all divisions
  myDivisionProfile, // Get the profile of the current user's division

  // Members controller
  allMembers, // Get a list of division members
  getMember, // Get a single member's details
  addMember, // Add a member to a division
  removeMember, // Remove a member from a division

  // Roles controller
  getRoles, // Get a list of division roles
  addRole, // Add a role to a division
  updateRole, // Update a role in a division
  removeRole, // Remove a role from a division

  // Role Assignments controller
  assignRole, // Assign a role to a member
  unassignRole, // Remove a role from a member
};
