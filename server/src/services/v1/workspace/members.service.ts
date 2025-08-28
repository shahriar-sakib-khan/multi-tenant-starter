import { HydratedDocument } from 'mongoose';

import { Errors } from '@/error';
import { IUser, Membership } from '@/models';
import { workspaceSanitizers } from '@/sanitizers';

/**
 * All active workspace members.
 *
 * @param {string} workspaceId - Workspace's ID.
 * @param {number} page - Page number.
 * @param {number} limit - Number of items per page.
 * @returns {Promise<HydratedDocument<IUser>[]>} List of active user of this workspaces.
 */
export const getAllWorkspaceMembers = async (
  workspaceId: string,
  page: number,
  limit: number
): Promise<{ members: { user: HydratedDocument<IUser>; roles: string[] }[]; total: number }> => {
  const total: number = await Membership.countDocuments({
    workspace: workspaceId,
    status: 'active',
  });

  if (total === 0) return { members: [], total };

  const skip: number = (page - 1) * limit;
  const memberships = await Membership.find({ workspace: workspaceId, status: 'active' })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username email');

  const members = memberships.map(m => ({
    user: m.user as unknown as HydratedDocument<IUser>,
    roles: m.workspaceRoles,
  }));

  return { members, total };
};

export const getWorkspaceMember = async (
  workspace: string,
  memberId: string
): Promise<workspaceSanitizers.SanitizedMembership> => {
  const member = await Membership.findOne({ workspace, user: memberId }).populate(
    'user',
    'username email'
  );
  if (!member) throw new Errors.BadRequestError('Member does not exist.');

  return workspaceSanitizers.membershipSanitizer(member);
};

/**
 * Remove a member from a workspace.
 *
 * @param {string} workspace - Workspace's ID.
 * @param {string} memberId - Member's ID.
 * @returns {Promise<workspaceSanitizers.SanitizedMembership>} Sanitized workspace member.
 */
export const removeWorkspaceMember = async (
  userId: string,
  workspace: string,
  memberId: string
): Promise<workspaceSanitizers.SanitizedMembership> => {
  if (userId === memberId) throw new Errors.BadRequestError('You cannot remove yourself.');

  const member = await Membership.findOneAndDelete({ workspace, user: memberId }).populate(
    'user',
    'username email'
  );
  if (!member) throw new Errors.BadRequestError('Member does not exist.');

  return workspaceSanitizers.membershipSanitizer(member);
};

export default {
  getAllWorkspaceMembers, // Fetches active members of a workspace with pagination, counts total, populates user info
  getWorkspaceMember, // Retrieves a single workspace member by ID, throws if missing, returns sanitized membership
  removeWorkspaceMember, // Deletes a member from workspace (cannot remove self), populates user info, returns sanitized membership
};
