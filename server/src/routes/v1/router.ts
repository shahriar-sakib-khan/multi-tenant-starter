import { Router } from 'express';

import { requireAuth, requireRole } from '@/middlewares';
import authRouter from './auth/router';
import adminRouter from './admin/router';
import userRouter from './user/router';
import workspaceRouter from './workspace/router';

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and session management
 *   - name: Admin
 *     description: Admin (ostad) routes
 *   - name: User
 *     description: User profile and account management
 *   - name: Workspace
 *     description: Workspace creation and tenant operations
 *   - name: Payment
 *     description: Payment and billing routes
 */

const router = Router();

router.use('/auth', authRouter);

// Authenticated routes
router.use('/user', requireAuth, userRouter);
router.use('/admin', requireAuth, requireRole('ostad'), adminRouter);
router.use('/workspace', requireAuth, workspaceRouter);

export default router;
