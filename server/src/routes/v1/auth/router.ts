import { Router } from 'express';

import { validateRequest, requireAuth, authValidator } from '@/middlewares';
import { authController } from '@/controllers/v1';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

const router = Router();

/**
 * ----------------- Auth Routes -----------------
 */

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRequest(authValidator.registerSchema), authController.register);

/**
 * @route   POST /auth/login
 * @desc    Log in a user with username/email and password
 * @access  Public
 */
router.post('/login', validateRequest(authValidator.loginSchema), authController.login);

/**
 * @route   POST /auth/logout
 * @desc    Log out the currently authenticated user
 * @access  Private
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh the access token using a valid refresh token
 * @access  Public
 */
router.post('/refresh', authController.refreshAccessToken);

export default router;
