import { Router } from 'express';

import v1Router from './v1/router';

/**
 * @swagger
 * tags:
 *   name: API
 *   description: API entry point for all versioned routes
 */

const apiRouter = Router();

/**
 * @swagger
 * /api/v1:
 *   get:
 *     summary: API version 1 root endpoint
 *     description: Entry point for all v1 routes of the API
 *     tags: [API]
 *     responses:
 *       200:
 *         description: API v1 available
 */
apiRouter.use('/v1', v1Router);

export default apiRouter;
