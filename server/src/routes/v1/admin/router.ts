import { Router } from 'express';

import { validateRequest, userValidator } from '@/middlewares';
import { adminController } from '@/controllers/v1';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin (ostad) routes
 */
const router = Router();

/**
 * ----------------- Admin User CRUD -----------------
 */

/**
 * @route   GET /admin/users
 * @desc    Get paginated users for admin view
 * @access  Private
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   GET /admin/users/:userId
 * @desc    Get a single user by ID with full sanitized fields
 * @access  Private
 */
router.get('/users/:userId', adminController.getSingleUser);

/**
 * @route   PATCH /admin/users/:userId
 * @desc    Admin updates allowed fields for a user
 * @access  Private
 */
router.patch(
  '/users/:userId',

  validateRequest(userValidator.updateUserSchema),
  adminController.adminUpdateUser
);

/**
 * @route   DELETE /admin/users/:userId
 * @desc    Admin deletes a user (cannot delete self)
 * @access  Private
 */
router.delete('/users/:userId', adminController.adminDeleteUser);

/**
 * ----------------- Application Stats -----------------
 */

/**
 * @route   GET /admin/stats/total-users
 * @desc    Get total number of users in the system
 * @access  Private
 */
router.get('/stats/total-users', adminController.getApplicationStats);

/**
 * @route   GET /admin/stats/active-users
 * @desc    Get total number of active users
 * @access  Private
 */
router.get('/stats/active-users', adminController.getActiveUsersStats);

/**
 * @route   GET /admin/stats/users-by-role
 * @desc    Get number of users grouped by role
 * @access  Private
 */
router.get('/stats/users-by-role', adminController.getUsersByRole);

/**
 * @route   GET /admin/stats/registration-trends
 * @desc    Get user registration trends over the last N days (default 30)
 * @access  Private
 */
router.get('/stats/registration-trends', adminController.getUserRegistrationTrends);

export default router;
