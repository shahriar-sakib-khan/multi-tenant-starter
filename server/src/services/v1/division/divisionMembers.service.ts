import { Errors } from '@/error';
import { Division, DivisionMembership, Membership, User } from '@/models';
import { divisionSanitizers } from '@/sanitizers';

/**
 * @function getDivisionMembers
 * @description Get all members of a division.
 *
 * @param {string} divisionId - The ID of the division to retrieve members for.
 * @param {string} workspaceId - The ID of the workspace the division is in.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of members to retrieve per page.
 * @returns {Promise<SanitizedDivisionMembers & { total: number }>} An array of user documents.
 */
export const getAllDivisionMembers = async (
  divisionId: string,
  workspaceId: string,
  page: number,
  limit: number
): Promise<divisionSanitizers.SanitizedDivisionMembers & { total: number }> => {
  // Check if division exists
  const divisionExist = await Division.exists({ _id: divisionId, workspace: workspaceId });
  if (!divisionExist) throw new Errors.NotFoundError('Division not found');

  // Check if division has members
  const total: number = await DivisionMembership.countDocuments({
    division: divisionId,
    workspace: workspaceId,
    status: 'active',
  });
  if (total === 0) return { members: [], total };

  // Get all members of the division
  const skip: number = (page - 1) * limit;
  const members = await DivisionMembership.find({
    division: divisionId,
    workspace: workspaceId,
    status: 'active',
  })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username email')
    .populate('invitedBy', 'username')
    .lean();

  return { members: divisionSanitizers.divisionMembersSanitizer(members).members, total };
};

/**
 * @function getSingleDivisionMember
 * @description Get a single member of a division.
 *
 * @param {string} memberId - The ID of the user to retrieve.
 * @param {string} divisionId - The ID of the division the user is in.
 * @param {string} workspaceId - The ID of the workspace the division is in.
 * @returns {Promise<SanitizedDivisionMembership>} The user document.
 * @throws {NotFoundError} If the division membership is not found.
 */
export const getSingleDivisionMember = async (
  memberId: string,
  divisionId: string,
  workspaceId: string
): Promise<divisionSanitizers.SanitizedDivisionMembership> => {
  // Check if member exists
  const divisionMembership = await DivisionMembership.findOne({
    user: memberId,
    division: divisionId,
    workspace: workspaceId,
  })
    .populate('user', 'username email')
    .lean();

  if (!divisionMembership) throw new Errors.NotFoundError('Member not found');

  return divisionSanitizers.divisionMembershipSanitizer(divisionMembership);
};

/**
 * @function addMemberToDivision
 * @description Add a member to a division.
 *
 * @param {string} memberIdentifier - The ID of the user to add to the division.
 * @param {string} workspaceId - The ID of the workspace the division is in.
 * @param {string} divisionId - The ID of the division to add the user to.
 * @param {string} invitedBy - The ID of the user who invited the member.
 * @returns {Promise<SanitizedDivisionMembership>} The created division membership document.
 */
export const addMemberToDivision = async (
  memberIdentifier: string,
  workspaceId: string,
  divisionId: string,
  invitedBy: string
): Promise<divisionSanitizers.SanitizedDivisionMembership> => {
  // Check if the member identifier is an email or user ID
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberIdentifier);
  const memberId = isEmail
    ? await User.findOne({ email: memberIdentifier }).select('_id').lean()
    : memberIdentifier;

  // Check if user is a member of the workspace
  const isWorkspaceMember = await Membership.exists({
    user: memberId,
    workspace: workspaceId,
    status: 'active',
  });
  if (!isWorkspaceMember)
    throw new Errors.BadRequestError('User is not a member of this workspace');

  // Check if user is already a member of the division
  const existingMembership = await DivisionMembership.exists({
    user: memberId,
    division: divisionId,
    workspace: workspaceId,
    status: 'active',
  });
  if (existingMembership)
    throw new Errors.BadRequestError('User already a member of this division');

  const divisionMembership = await DivisionMembership.create({
    user: memberId,
    division: divisionId,
    workspace: workspaceId,
    divisionRoles: ['division_member'],
    status: 'active',
    invitedBy,
  });

  await divisionMembership.populate('user', 'username email');

  return divisionSanitizers.divisionMembershipSanitizer(divisionMembership);
};

/**
 * @function removeMemberFromDivision
 * @description Remove a member from a division.
 *
 * @param {string} memberIdentifier - The ID of the user to remove from the division.
 * @param {string} workspaceId - The ID of the workspace the division is in.
 * @param {string} divisionId - The ID of the division to remove the user from.
 * @returns {Promise<SanitizedDivisionMembership>} The removed division membership document.
 */
export const removeMemberFromDivision = async (
  memberIdentifier: string,
  workspaceId: string,
  divisionId: string
): Promise<divisionSanitizers.SanitizedDivisionMembership> => {
  // Check if the member identifier is an email or user ID
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberIdentifier);
  const memberId = isEmail
    ? await User.findOne({ email: memberIdentifier }).select('_id').lean()
    : memberIdentifier;

  //Delete the division membership
  const divisionMembership = await DivisionMembership.findOneAndDelete({
    user: memberId,
    workspace: workspaceId,
    division: divisionId,
  })
    .populate('user', 'username email')
    .lean();

  if (!divisionMembership) throw new Errors.BadRequestError('Not a member of this division');

  return divisionSanitizers.divisionMembershipSanitizer(divisionMembership);
};

export default {
  getAllDivisionMembers, // Retrieves all active members of a division with pagination, populates user and inviter, returns sanitized members with total count
  getSingleDivisionMember, // Fetches a single division member by user ID, populates user, returns sanitized membership, throws NotFound if missing
  addMemberToDivision, // Adds a user to a division, validates workspace membership and duplicates, assigns default role, populates user, returns sanitized membership
  removeMemberFromDivision, // Removes a user from a division, validates existence, populates user, returns sanitized removed membership
};
