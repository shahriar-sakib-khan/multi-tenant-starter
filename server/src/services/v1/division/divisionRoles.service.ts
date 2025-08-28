import { Division, DivisionMembership } from '@/models';
import { Errors } from '@/error';
import {
  DivisionRoleInput,
  DivisionUpdateRoleInput,
} from '@/middlewares/validators/division.validation';
import { divisionSanitizers } from '@/sanitizers';

/**
 * @function getDivisionRoles
 * @description Get all roles for a division.
 *
 * @param {string} divisionId - The ID of the division to retrieve roles for.
 * @returns {Promise<{ name: string; permissions: string[] }[]>} An array of role objects.
 */
export const getDivisionRoles = async (
  divisionId: string
): Promise<{ name: string; permissions: string[] }[]> => {
  const division = await Division.findById(divisionId).select('divisionRoles').lean();

  if (!division) throw new Error('Division not found');

  return division.divisionRoles;
};

/**
 * @function addRoleToDivision
 * @description Add a role to a division.
 *
 * @param {DivisionRoleInput} role - The name of the role to add.
 * @param {string} divisionId - The ID of the division to add the role to.
 * @returns {Promise<{ name: string; permissions: string[]}[] >} The updated division document.
 */
export const addRoleToDivision = async (
  role: DivisionRoleInput,
  divisionId: string
): Promise<{ name: string; permissions: string[] }[]> => {
  const division = await Division.findById(divisionId).select('divisionRoles');

  if (!division) throw new Error('Division not found');

  if (division.divisionRoles.find(r => r.name === role.name))
    throw new Error('Role already exists');

  division.divisionRoles.push(role);
  division.save();

  return division.divisionRoles;
};

/**
 * @function updateRoleInDivision
 * @description Update a role in a division.
 *
 * @param {DivisionRoleInput} role - The name of the role to update.
 * @param {string} roleId - The ID of the role to update.
 * @param {string} divisionId - The ID of the division to update the role in.
 * @returns {Promise<{ name: string; permissions: string[]}, { name: string; permissions: string[] }[] >} The updated division document.
 */
export const updateRoleInDivision = async (
  role: DivisionUpdateRoleInput,
  roleId: string,
  divisionId: string
): Promise<{
  roleToUpdate: { name: string; permissions: string[] };
  divisionRoles: { name: string; permissions: string[] }[];
}> => {
  const division = await Division.findById(divisionId).select('divisionRoles');

  if (!division) throw new Error('Division not found');

  const roleToUpdate = division.divisionRoles.find(r => r._id?.toString() === roleId);

  if (!roleToUpdate) throw new Error('Role not found');

  if (role.name) roleToUpdate.name = role.name;
  if (role.permissions) roleToUpdate.permissions = role.permissions;
  division.save();

  return { roleToUpdate, divisionRoles: division.divisionRoles };
};

/**
 * @function removeRoleFromDivision
 * @description Remove a role from a division.
 *
 * @param {string} roleId - The name of the role to remove.
 * @param {string} divisionId - The ID of the division to remove the role from.
 * @returns {Promise<{ name: string; permissions: string[]}, { name: string; permissions: string[] }[] >} The updated division document.
 */
export const removeRoleFromDivision = async (
  roleId: string,
  divisionId: string
): Promise<{
  roleToRemove: { name: string; permissions: string[] };
  divisionRoles: { name: string; permissions: string[] }[];
}> => {
  const division = await Division.findById(divisionId).select('divisionRoles');

  if (!division) throw new Error('Division not found');

  const roleToRemove = division.divisionRoles.find(r => r._id?.toString() === roleId);

  if (!roleToRemove) throw new Error('Role not found');

  division.divisionRoles = division.divisionRoles.filter(r => r._id?.toString() !== roleId);
  division.save();

  return { roleToRemove, divisionRoles: division.divisionRoles };
};

/**
 * @function assignRoleToUser
 * @description Assign a role to a user.
 *
 * @param {string} roleId - The ID of the role to assign.
 * @param {string} userId - The ID of the user to assign the role to.
 * @param {string} workspaceId - The ID of the workspace the division is in.
 * @param {string} divisionId - The ID of the division to assign the role to.
 * @returns {Promise<SanitizedDivisionMembership>} The updated division membership document.
 */
export const assignRoleToUser = async (
  roleId: string,
  userId: string,
  divisionId: string,
  workspaceId: string
): Promise<divisionSanitizers.SanitizedDivisionMembership> => {
  const divisionMembership = await DivisionMembership.findOne({
    user: userId,
    workspace: workspaceId,
    division: divisionId,
  })
    .populate('user', 'username email')
    .populate('division', 'name')
    .populate('workspace', 'name');

  if (!divisionMembership) throw new Errors.NotFoundError('Not a member of division');

  const division = await Division.findById(divisionId).select('divisionRoles').lean();
  if (!division) throw new Errors.NotFoundError('Division not found');

  const role = division.divisionRoles.find(r => r._id?.toString() === roleId);
  if (!role) throw new Errors.BadRequestError('Invalid role');

  const roleToAdd = role.name;

  if (divisionMembership.divisionRoles.some(r => r === roleToAdd))
    throw new Errors.BadRequestError('Role already assigned');

  divisionMembership.divisionRoles.push(roleToAdd);
  await divisionMembership.save();

  return divisionSanitizers.divisionMembershipSanitizer(divisionMembership);
};

/**
 * @function unassignRoleFromUser
 * @description Unassign a role from a user.
 *
 * @param {string} roleId - The ID of the role to unassign.
 * @param {string} userId - The ID of the user to unassign the role from.
 * @param {string} divisionId - The ID of the division the user is in.
 * @param {string} workspaceId - The ID of the workspace the division is in.
 * @returns {Promise<SanitizedDivisionMembership>} The updated division membership document.
 */
export const unassignRoleFromUser = async (
  roleId: string,
  userId: string,
  divisionId: string,
  workspaceId: string
): Promise<divisionSanitizers.SanitizedDivisionMembership> => {
  const divisionMembership = await DivisionMembership.findOne({
    user: userId,
    division: divisionId,
    workspace: workspaceId,
  })
    .populate('user', 'username email')
    .populate('division', 'name')
    .populate('workspace', 'name');

  if (!divisionMembership) throw new Errors.NotFoundError('Not a member of division');

  const division = await Division.findById(divisionId).select('divisionRoles').lean();
  if (!division) throw new Errors.NotFoundError('Division not found');

  const role = division.divisionRoles.find(r => r._id?.toString() === roleId);
  if (!role) throw new Errors.BadRequestError('Invalid role');

  const roleToRemove = role.name;

  if (!divisionMembership.divisionRoles.some(r => r === roleToRemove))
    throw new Errors.BadRequestError('Role not assigned');

  divisionMembership.divisionRoles = divisionMembership.divisionRoles.filter(
    r => r !== roleToRemove
  );
  await divisionMembership.save();

  return divisionSanitizers.divisionMembershipSanitizer(divisionMembership);
};

// <============================> Exports <============================>

export default {
  getDivisionRoles, // Retrieves all roles of a division by ID, throws error if division not found
  addRoleToDivision, // Adds a new role to a division, prevents duplicates, saves to DB
  updateRoleInDivision, // Updates a role in a division by role ID, validates existence, saves updated division
  removeRoleFromDivision, // Removes a role from a division by role ID, updates DB, throws if not found

  assignRoleToUser, // Assigns a role to a user in a division, validates membership and role existence, saves updated membership, returns sanitized data
  unassignRoleFromUser, // Removes a role from a user in a division, validates membership and role assignment, updates membership, returns sanitized data
};
