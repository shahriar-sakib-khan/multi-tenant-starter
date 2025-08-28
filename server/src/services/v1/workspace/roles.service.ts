import { Errors } from '@/error';
import { Workspace, IWorkspace, Membership } from '@/models';
import { workspaceSanitizers } from '@/sanitizers';
import { RolesInput } from '@/middlewares/validators/workspace.validation';

/**
 * All roles of the workspace.
 *
 * @param {string} workspaceId - Workspace's ID.
 * @returns {Promise<IWorkspace['workspaceRoles']>} List of workspace roles.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const getWorkspaceRoles = async (
  workspaceId: string
): Promise<IWorkspace['workspaceRoles']> => {
  const workspace = await Workspace.findById(workspaceId).select('workspaceRoles').lean();

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspace.workspaceRoles;
};

/**
 * Adds a new role to the workspace roles.
 *
 * @param {RolesInput} userData - Workspace update data.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<IWorkspace['workspaceRoles']>} List of workspace roles.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const addWorkspaceRole = async (
  userData: RolesInput,
  workspaceId: string
): Promise<IWorkspace['workspaceRoles']> => {
  const { name, permissions } = userData;
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $push: { workspaceRoles: { name, permissions } } },
    { new: true }
  );

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspace.workspaceRoles;
};

/**
 * Updates a role of the workspace roles.
 *
 * @param {RolesInput} userData - Workspace update data.
 * @param {string} roleId - Role ID.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<IWorkspace['workspaceRoles']>} List of workspace roles.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const updateWorkspaceRole = async (
  userData: RolesInput,
  roleId: string,
  workspaceId: string
): Promise<IWorkspace['workspaceRoles']> => {
  const { name, permissions } = userData;
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId, 'workspaceRoles._id': roleId },
    { $set: { 'workspaceRoles.$.name': name, 'workspaceRoles.$.permissions': permissions } },
    { new: true }
  );

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspace.workspaceRoles;
};

/**
 * Removes a role of the workspace roles.
 *
 * @param {string} roleId - Role ID.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<IWorkspace['workspaceRoles']>} List of workspace roles.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const removeWorkspaceRole = async (
  roleId: string,
  workspaceId: string
): Promise<IWorkspace['workspaceRoles']> => {
  const workspace = await Workspace.findOneAndUpdate(
    { _id: workspaceId },
    { $pull: { workspaceRoles: { _id: roleId } } },
    { new: true }
  );

  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  return workspace.workspaceRoles;
};

/**
 * Assigns a role to a user in the workspace.
 *
 * @param {string} userId - User's ID.
 * @param {string} roleId - Role ID.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<SanitizedMembership>} Sanitized membership.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const assignRoleToUser = async (
  userId: string,
  roleId: string,
  workspaceId: string
): Promise<workspaceSanitizers.SanitizedMembership> => {
  const workspace = await Workspace.findById(workspaceId).select('workspaceRoles').lean();
  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  const role = workspace.workspaceRoles.filter(role => (role._id?.equals(roleId) ? role : null));
  if (!role) throw new Errors.NotFoundError('Role not found in workspace');

  const membership = await Membership.findOneAndUpdate(
    { user: userId, workspace: workspaceId },
    { $addToSet: { workspaceRoles: role[0].name } },
    { new: true }
  )
    .populate('user', 'username email')
    .populate('workspace', 'name');

  if (!membership) throw new Errors.NotFoundError('Membership not found');

  return workspaceSanitizers.membershipSanitizer(membership);
};

/**
 * Unassign a role from a user in the workspace.
 *
 * @param {string} userId - User's ID.
 * @param {string} roleId - Role ID.
 * @param {string} workspaceId - Workspace ID.
 * @returns {Promise<SanitizedMembership>} Sanitized membership.
 * @throws {Errors.NotFoundError} If workspace not found.
 */
export const unassignRoleFromUser = async (
  userId: string,
  roleId: string,
  workspaceId: string
): Promise<workspaceSanitizers.SanitizedMembership> => {
  const workspace = await Workspace.findById(workspaceId).select('workspaceRoles').lean();
  if (!workspace) throw new Errors.NotFoundError('Workspace not found');

  const role = workspace.workspaceRoles.filter(role => (role._id?.equals(roleId) ? role : null));
  if (!role) throw new Errors.NotFoundError('Role not found in workspace');

  const membership = await Membership.findOneAndUpdate(
    { user: userId, workspace: workspaceId },
    { $pull: { workspaceRoles: role[0].name } },
    { new: true }
  )
    .populate('user', 'username email')
    .populate('workspace', 'name');

  if (!membership) throw new Errors.NotFoundError('Membership not found');

  return workspaceSanitizers.membershipSanitizer(membership);
};

export default {
  getWorkspaceRoles, // Fetches workspace roles by ID from DB, throws NotFound if missing
  addWorkspaceRole, // Adds a new role to workspaceRoles array in DB, returns updated roles
  removeWorkspaceRole, // Removes a role from workspaceRoles array in DB, returns updated roles
  updateWorkspaceRole, // Updates a specific role's name and permissions in workspaceRoles array, returns updated roles

  assignRoleToUser, // Assigns a workspace role to a user, updates Membership in DB, returns sanitized membership
  unassignRoleFromUser, // Removes a workspace role from a user, updates Membership in DB, returns sanitized membership
};
