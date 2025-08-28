import { Router } from 'express';

import { validateRequest, requireAuth, userValidator } from '@/middlewares';
import { userController } from '@/controllers/v1';

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile routes
 */
const router = Router();

/**
 * ----------------- User Routes -----------------
 */

/**
 * @route   GET /user/me
 * @desc    Get the currently authenticated user's profile
 * @access  Private
 */
router.get('/me', requireAuth, userController.getCurrentUser);

/**
 * @route   PUT /user/me
 * @desc    Update the currently authenticated user's profile
 * @access  Private
 */
router.put(
  '/me',
  requireAuth,
  validateRequest(userValidator.updateUserSchema),
  userController.updateUser
);

export default router;
