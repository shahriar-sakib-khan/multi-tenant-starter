/**
 * @module user.service
 *
 * @description Services for user related operations:
 */

import { User } from '@/models';
import { Errors } from '@/error';
import { userSanitizers } from '@/sanitizers';
import { userValidator } from '@/middlewares';

/**
 * @function getCurrentUser
 * Retrieves the current user by ID.
 *
 * @param {string} userId - User's ID.
 * @returns {Promise<SanitizedUser>} The sanitized user object.
 * @throws {Errors.NotFoundError} If user not found.
 */
export const getCurrentUser = async (userId: string): Promise<userSanitizers.SanitizedUser> => {
  const user = await User.findById(userId).lean();

  if (!user) throw new Errors.NotFoundError('User not found');

  return userSanitizers.userSanitizer(user);
};

/**
 * @function updateUser
 * Updates the current user's profile with allowed fields.
 *
 * @param {string} userId - User's ID.
 * @param {UpdateUserInput} userData - User update data.
 * @returns {Promise<SanitizedUser>} The updated sanitized user.
 * @throws {Errors.BadRequestError} If no valid fields provided or email already exists.
 * @throws {Errors.NotFoundError} If user not found.
 */
export const updateUser = async (
  userId: string,
  userData: userValidator.UpdateUserInput
): Promise<userSanitizers.SanitizedUser> => {
  if (Object.keys(userData).length === 0) {
    throw new Errors.BadRequestError('No valid fields provided for update');
  }

  // Validate email and username uniqueness
  if (userData.email) {
    const existingUser = await User.findOne({ email: userData.email }).lean();
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Errors.BadRequestError('Email already exists');
    }
  }
  if (userData.username) {
    const existingUser = await User.findOne({ username: userData.username }).lean();
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Errors.BadRequestError('Username already exists');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updatedUser) throw new Errors.NotFoundError('User not found');

  return userSanitizers.userSanitizer(updatedUser);
};

export default {
  getCurrentUser, // Fetches user by ID from DB, throws NotFound if missing, returns sanitized user object
  updateUser, // Updates allowed user fields in DB, validates email uniqueness, returns sanitized updated user
};
