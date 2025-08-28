/**
 * ----------------- User Controller -----------------
 *
 * Handles all logic for retrieving and updating the current user.
 *
 * @module controllers/user
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { userService } from '@/services/v1';
import { assertAuth } from '@/common';

/**
 * ----------------- User CRUD -----------------
 */

/**
 * @function getCurrentUser
 * @desc Retrieves the current authenticated user by ID and returns sanitized user data.
 * @route GET /api/v1/user/me
 * @access Private
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;

  const user = await userService.getCurrentUser(userId);

  res.status(StatusCodes.OK).json({ user });
};

/**
 * @function updateUser
 * @desc Updates the current authenticated user's allowed profile fields and returns sanitized updated user.
 * @route PATCH /api/v1/user/me
 * @access Private
 */
export const updateUser = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.user;

  const updatedUser = await userService.updateUser(userId, req.body);

  res
    .status(StatusCodes.OK)
    .json({ message: 'User profile updated successfully', user: updatedUser });
};

/**
 * ----------------- Default export (user controllers) -----------------
 */
export default {
  getCurrentUser, // Fetches current user by ID, returns sanitized user object
  updateUser, // Updates allowed fields of current user, validates email, returns sanitized user
};
