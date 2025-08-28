/**
 * @module AuthController
 *
 * @description Controller for authentication related operations.
 */

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { authService } from '@/services/v1';
import { Tokens } from '@/utils';

/**
 * ----------------- Authentication Controllers -----------------
 */

/**
 * @function register
 * @desc Registers a new user after validation, returns user data.
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response) => {
  const user = await authService.registerUser(req.body);

  res.status(StatusCodes.CREATED).json({
    message: 'User registered successfully',
    user,
  });
};

/**
 * @function login
 * @desc Authenticates user, issues access token and sets HTTP-only refresh token cookie.
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response) => {
  const user = await authService.loginUser(req.body);

  const accessToken = Tokens.createAccessToken({ userId: user.id, role: user.role });
  const refreshToken = Tokens.createRefreshToken({ userId: user.id });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(Date.now() + Number(process.env.JWT_REFRESH_EXPIRES_IN_MS)),
    sameSite: 'strict',
    path: '/', // ensures cookie is cleared correctly on logout
  });

  res.status(StatusCodes.OK).json({
    message: 'Login successful',
    user,
    accessToken,
  });
};

/**
 * @function logout
 * @desc Logs out user by clearing the refresh token cookie.
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = (req: Request, res: Response) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Unix epoch
    sameSite: 'strict',
    path: '/',
  });

  res.status(StatusCodes.OK).json({ message: 'User logged out successfully' });
};

/**
 * @function refreshAccessToken
 * @desc Generates a new access token using a valid refresh token (user is pre-attached to request).
 * @route POST /api/v1/auth/refresh-token
 * @access Private
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const accessToken = await authService.refreshAccessToken(refreshToken);

  res.status(StatusCodes.OK).json({ accessToken });
};

/**
 * ----------------- Auth Controllers (default export) -----------------
 */
export default {
  register, // Register a new user
  login, // Login user and issue tokens
  logout, // Logout user and clear refresh token
  refreshAccessToken, // Refresh access token using refresh token
};
