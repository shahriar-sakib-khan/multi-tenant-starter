/**
 * @module workspace.service
 *
 * @description Services for workspace related operations:
 */

import { HydratedDocument, Types } from 'mongoose';

import { IWorkspace, Membership, Workspace } from '@/models';
import { WorkspaceInput } from '@/middlewares/validators/workspace.validation';
import { Errors } from '@/error';
import { workspaceSanitizers } from '@/sanitizers';

/**
 * @function createWorkspace
 * @description Creates a new workspace for the given user.
 * Returns only sanitized workspace fields.
 *
 * @param {WorkspaceInput} userData - Workspace creation data.
 * @param {string} userId - The creator's user ID.
 * @returns {Promise<SanitizedWorkspace>} The sanitized workspace object.
 * @throws {Errors.BadRequestError} If workspace name already exists.
 */

export const createWorkspace = async (
  userData: WorkspaceInput,
  userId: string
): Promise<workspaceSanitizers.SanitizedWorkspace> => {
  const { name, description } = userData;

  // Prevent duplicate workspaces for the same user
  const existingWorkspace = await Workspace.exists({ name, createdBy: userId });
  if (existingWorkspace) {
    throw new Errors.BadRequestError('Workspace name already exists');
  }

  // Create workspace
  const workspace = await Workspace.create({
    name,
    description,
    createdBy: new Types.ObjectId(userId),
  });

  // Automatically assign creator as admin
  await Membership.create({
    user: new Types.ObjectId(userId),
    workspace: workspace._id,
    workspaceRoles: ['admin'],
    status: 'active',
  });

  // Return only the relevant, sanitized fields
  return workspaceSanitizers.workspaceSanitizer(workspace);
};

/**
 * @function getAllWorkspaces
 * @description Retrieves all active workspaces for a given user by querying memberships.
 *
 * @param {string} userId - User's ID.
 * @returns {Promise<SanitizedAllWorkspaces & { total: number }>} List of active workspaces with count.
 */
export const getAllWorkspaces = async (
  userId: string,
  page: number,
  limit: number
): Promise<workspaceSanitizers.SanitizedWorkspaces & { total: number }> => {
  const skip: number = (page - 1) * limit;
  const memberships = await Membership.find({ user: userId, status: 'active' })
    .skip(skip)
    .limit(limit)
    .populate<{ workspace: HydratedDocument<IWorkspace> }>('workspace');

  const workspaces = memberships.map(m => m.workspace as HydratedDocument<IWorkspace>);

  const total: number = await Membership.countDocuments({ user: userId, status: 'active' });

  return {
    workspaces: workspaceSanitizers.allWorkspaceSanitizer(workspaces, ['id', 'name']).workspaces,
    total,
  };
};

/**
 * @function getWorkspaceById
 * Finds a workspace by its unique _id.
 *
 * @param {string} workspaceId - Workspace name.
 * @returns {Promise<SanitizedWorkspace>} Workspace document.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const getSingleWorkspace = async (
  workspaceId: string
): Promise<workspaceSanitizers.SanitizedWorkspace> => {
  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspaceSanitizers.workspaceSanitizer(workspace);
};

/**
 * @function updateWorkspace
 * Updates the user's workspace.
 *
 * @param {WorkspaceInput} userData - Workspace update data.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<SanitizedWorkspace>} Updated workspace document.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const updateWorkspace = async (
  userData: WorkspaceInput,
  workspaceId: string
): Promise<workspaceSanitizers.SanitizedWorkspace> => {
  const { name, description } = userData;
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { name, description },
    { new: true }
  )
    .select('name description')
    .lean();

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspaceSanitizers.workspaceSanitizer(workspace);
};

/**
 * @function deleteWorkspace
 * Deletes the user's workspace.
 *
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<SanitizedAllWorkspaces>} Deleted workspace document.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const deleteWorkspace = async (
  workspaceId: string
): Promise<workspaceSanitizers.SanitizedWorkspace> => {
  const workspace = await Workspace.findByIdAndDelete(workspaceId)
    .select('name description')
    .lean();

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspaceSanitizers.workspaceSanitizer(workspace);
};

/**
 * @function getMyWorkspaceProfile
 * Retrieves the user's workspace profile.
 *
 * @param {string} userId - User's ID.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<SanitizedMembership>} User's workspace profile.
 * @throws {Errors.NotFoundError} If user is not a member of the workspace.
 */
export const getMyWorkspaceProfile = async (
  userId: string,
  workspaceId: string
): Promise<workspaceSanitizers.SanitizedMembership> => {
  const membership = await Membership.findOne({ user: userId, workspace: workspaceId })
    .populate('workspace', 'name')
    .populate('user', 'username email')
    .lean();

  if (!membership) throw new Errors.NotFoundError('Not a member of the workspace');

  return workspaceSanitizers.membershipSanitizer(membership);
};

export default {
  createWorkspace, // Creates a new workspace, ensures no duplicate name for user, assigns creator as admin, returns sanitized workspace
  getAllWorkspaces, // Fetches all active memberships for user, populates workspaces, returns sanitized workspace list with total count
  getSingleWorkspace, // Retrieves a single workspace by ID, throws NotFound if missing, returns sanitized workspace
  updateWorkspace, // Updates workspace fields (name, description), returns sanitized updated workspace, throws NotFound if missing
  deleteWorkspace, // Deletes workspace by ID, returns sanitized deleted workspace, throws NotFound if missing

  getMyWorkspaceProfile, // Fetches user's membership profile in workspace, populates user and workspace, returns sanitized membership
};
