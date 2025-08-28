/**
 * @module admin.user.service
 *
 * @description Services for user-related operations (admin scope)
 */

import { User, IUser } from '@/models';
import { Errors } from '@/error';
import { userSanitizers } from '@/sanitizers';

/**
 * @function getAllUsers
 * @description Retrieves paginated users and total count.
 *
 * Returns only minimal fields (id, username, email) for list view.
 *
 * @param {number} page - Page number.
 * @param {number} limit - Number of users per page.
 * @returns {Promise<userSanitizers.SanitizedUsers & { totalUsers: number }>} Paginated sanitized users with total count.
 */
export const getAllUsers = async (
  page: number,
  limit: number
): Promise<userSanitizers.SanitizedUsers & { totalUsers: number }> => {
  const skip: number = (page - 1) * limit;

  const usersDocs = await User.find().skip(skip).limit(limit).lean();
  const totalUsers: number = await User.countDocuments();

  return {
    users: userSanitizers.allUserSanitizer(usersDocs, ['id', 'username', 'email']).users,
    totalUsers,
  };
};

/**
 * @function getSingleUser
 * @description Retrieves a single user by ID with full sanitized fields.
 *
 * @param {string} userId - User ID.
 * @returns {Promise<userSanitizers.SanitizedUser>} Sanitized user object.
 * @throws {Errors.NotFoundError} If user not found.
 */
export const getSingleUser = async (userId: string): Promise<userSanitizers.SanitizedUser> => {
  const user = await User.findById(userId).lean();

  if (!user) throw new Errors.NotFoundError('User not found');

  return userSanitizers.userSanitizer(user);
};

/**
 * @function adminUpdateUser
 * @description Admin updates any user's allowed fields.
 *
 * @param {string} userId - Target user ID.
 * @param {Partial<IUser>} userData - Fields to update.
 * @returns {Promise<userSanitizers.SanitizedUser>} Updated sanitized user.
 * @throws {Errors.BadRequestError} If no valid fields or email already exists.
 * @throws {Errors.NotFoundError} If user not found.
 */
export const adminUpdateUser = async (
  userId: string,
  userData: Partial<IUser>
): Promise<userSanitizers.SanitizedUser> => {
  const allowedFields = ['firstName', 'lastName', 'username', 'email', 'address', 'roles'];
  const updates: Partial<IUser> = {};

  allowedFields.forEach(field => {
    if (userData[field as keyof IUser] !== undefined) {
      updates[field as keyof IUser] = userData[field as keyof IUser]!;
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new Errors.BadRequestError('No valid fields provided for update');
  }

  if (updates.email) {
    const existingUser = await User.findOne({ email: updates.email }).lean();
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Errors.BadRequestError('Email already exists');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updatedUser) throw new Errors.NotFoundError('User not found');

  return userSanitizers.userSanitizer(updatedUser);
};

/**
 * @function adminDeleteUser
 * @description Admin deletes a user; prevents self-deletion.
 *
 * @param {string} adminId - Admin's own user ID.
 * @param {string} targetUserId - Target user ID.
 * @returns {Promise<userSanitizers.SanitizedUser>} Deleted sanitized user.
 * @throws {Errors.BadRequestError} If admin attempts to delete themselves.
 * @throws {Errors.NotFoundError} If user not found.
 */
export const adminDeleteUser = async (
  adminId: string,
  targetUserId: string
): Promise<userSanitizers.SanitizedUser> => {
  if (adminId === targetUserId) {
    throw new Errors.BadRequestError('Admin cannot delete themselves');
  }

  const user = await User.findByIdAndDelete(targetUserId).lean();

  if (!user) throw new Errors.NotFoundError('User not found');

  return userSanitizers.userSanitizer(user);
};

export default {
  getAllUsers, // Fetches paginated users from DB, sanitizes minimal fields (id, username, email), returns total count
  getSingleUser, // Fetches single user by ID from DB, throws NotFound if missing, returns full sanitized user
  adminUpdateUser, // Updates allowed user fields in DB by admin, validates email uniqueness, returns sanitized updated user
  adminDeleteUser, // Deletes user by admin (prevents self-deletion), returns sanitized deleted user
};
