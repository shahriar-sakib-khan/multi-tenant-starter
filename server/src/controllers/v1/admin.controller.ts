/**
 * ----------------- Admin User Controller -----------------
 *
 * Handles all logic for admin user management and application stats.
 *
 * @module controllers/adminUser
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { adminStatsService, adminUserService } from '@/services/v1';
import { assertAuth } from '@/common';

/**
 * ----------------- Admin User CRUD -----------------
 */

/**
 * @function getAllUsers
 * @desc Retrieves paginated users (minimal fields) for admin view.
 * @route GET /api/v1/admin/users
 * @access Private (Admin)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  assertAuth(req);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const { users, totalUsers } = await adminUserService.getAllUsers(page, limit);

  res.status(StatusCodes.OK).json({ totalUsers, page, limit, users });
};

/**
 * @function getSingleUser
 * @desc Retrieves a single user by ID with full sanitized fields.
 * @route GET /api/v1/admin/users/:userId
 * @access Private (Admin)
 */
export const getSingleUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await adminUserService.getSingleUser(userId);

  res.status(StatusCodes.OK).json({ user });
};

/**
 * @function adminUpdateUser
 * @desc Admin updates any user's allowed fields and returns sanitized updated user.
 * @route PATCH /api/v1/admin/users/:userId
 * @access Private (Admin)
 */
export const adminUpdateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const updatedUser = await adminUserService.adminUpdateUser(userId, req.body);

  res.status(StatusCodes.OK).json({ message: 'User updated successfully', user: updatedUser });
};

/**
 * @function adminDeleteUser
 * @desc Admin deletes a user (cannot delete self), returns sanitized deleted user.
 * @route DELETE /api/v1/admin/users/:userId
 * @access Private (Admin)
 */
export const adminDeleteUser = async (req: Request, res: Response) => {
  assertAuth(req);
  const { userId } = req.params;
  const { userId: adminId } = req.user;

  const deletedUser = await adminUserService.adminDeleteUser(adminId, userId);

  res.status(StatusCodes.OK).json({ message: 'User deleted successfully', user: deletedUser });
};

/**
 * ----------------- Application Stats -----------------
 */

/**
 * @function getApplicationStats
 * @desc Retrieves total number of users in the system.
 * @route GET /api/v1/admin/stats/total-users
 * @access Private (Admin)
 */
export const getApplicationStats = async (_req: Request, res: Response) => {
  const stats = await adminStatsService.getApplicationStats();
  res.status(StatusCodes.OK).json(stats);
};

/**
 * @function getActiveUsersStats
 * @desc Retrieves count of active users.
 * @route GET /api/v1/admin/stats/active-users
 * @access Private (Admin)
 */
export const getActiveUsersStats = async (_req: Request, res: Response) => {
  const stats = await adminStatsService.getActiveUsersStats();
  res.status(StatusCodes.OK).json(stats);
};

/**
 * @function getUsersByRole
 * @desc Retrieves number of users grouped by their roles.
 * @route GET /api/v1/admin/stats/users-by-role
 * @access Private (Admin)
 */
export const getUsersByRole = async (_req: Request, res: Response) => {
  const stats = await adminStatsService.getUsersByRole();
  res.status(StatusCodes.OK).json(stats);
};

/**
 * @function getUserRegistrationTrends
 * @desc Retrieves user registration trends over the last N days (default 30).
 * @route GET /api/v1/admin/stats/registration-trends
 * @access Private (Admin)
 */
export const getUserRegistrationTrends = async (req: Request, res: Response) => {
  const days = Number(req.query.days) || 30;
  const trends = await adminStatsService.getUserRegistrationTrends(days);
  res.status(StatusCodes.OK).json(trends);
};

/**
 * ----------------- Default export (admin controllers) -----------------
 */
export default {
  // Admin User CRUD
  getAllUsers, // Get paginated users (minimal fields) for admin view
  getSingleUser, // Get a single user by ID with full sanitized fields
  adminUpdateUser, // Admin updates allowed fields for a user
  adminDeleteUser, // Admin deletes a user (prevents self-deletion)

  // Admin Stats
  getApplicationStats, // Get total number of users
  getActiveUsersStats, // Get total number of active users
  getUsersByRole, // Get number of users grouped by role
  getUserRegistrationTrends, // Get user registration trends over the last N days
};
