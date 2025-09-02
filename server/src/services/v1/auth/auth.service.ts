import { User } from '@/models';
import { Errors } from '@/error';
import { JWTs, Passwords } from '@/utils';
import { userSanitizers } from '@/sanitizers';
import { authValidator } from '@/middlewares';

/**
 * @module auth.service
 *
 * @description Centralized authentication service.
 * Handles user registration, login, token refresh, and token verification.
 */

/**
 * @function registerUser
 * @description Registers a new user in the system.
 *
 * - Validates uniqueness of email and username
 * - Hashes password before persisting
 * - Returns sanitized user (no password, no internals)
 *
 * @param {authValidator.RegisterInput} userData - Registration payload.
 * @returns {Promise<userSanitizers.SanitizedUser>} Newly created sanitized user.
 * @throws {Errors.BadRequestError} If email or username already exists.
 */
export const registerUser = async (
  userData: authValidator.RegisterInput
): Promise<userSanitizers.SanitizedUser> => {
  const { firstName, lastName, username, email, password, address } = userData;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  })
    .select('email username')
    .lean();

  if (existingUser) {
    if (existingUser.email === email) throw new Errors.BadRequestError('Email already exists');
    if (existingUser.username === username)
      throw new Errors.BadRequestError('Username already exists');
  }

  const hashedPassword = await Passwords.hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    address,
    password: hashedPassword,
  });

  return userSanitizers.userSanitizer(user);
};

/**
 * @function loginUser
 * @description Authenticates a user via email or username with password.
 *
 * - Looks up user by email or username
 * - Validates provided password against hash
 * - Returns sanitized user
 *
 * @param {authValidator.LoginInput} credentials - Login identifier + password.
 * @returns {Promise<userSanitizers.SanitizedUser>} Authenticated sanitized user.
 * @throws {Errors.UnauthenticatedError} If user not found or password mismatch.
 */
export const loginUser = async ({
  loginIdentifier,
  password,
}: authValidator.LoginInput): Promise<userSanitizers.SanitizedUser> => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);

  const user = await User.findOne(
    isEmail ? { email: loginIdentifier } : { username: loginIdentifier }
  )
    .select('+password')
    .lean();

  if (!user) throw new Errors.UnauthenticatedError('Invalid credentials');

  const isValid = await Passwords.compareHashedPassword(password, user.password);
  if (!isValid) throw new Errors.UnauthenticatedError('Invalid credentials');

  return userSanitizers.userSanitizer(user);
};

/**
 * @function refreshAccessToken
 * @description Issues a new access token from a valid refresh token.
 *
 * - Verifies refresh token
 * - Ensures user still exists
 * - Generates short-lived access token
 *
 * @param {string} refreshToken - Refresh token string.
 * @returns {Promise<string>} New access token.
 * @throws {Errors.UnauthenticatedError} If refresh token is missing or invalid.
 * @throws {Errors.NotFoundError} If user not found.
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  if (!refreshToken) throw new Errors.UnauthenticatedError('Refresh token missing');

  const { userId } = JWTs.verifyRefreshToken(refreshToken);

  const user = await User.findById(userId).lean();
  if (!user) throw new Errors.NotFoundError('User not found');

  const accessToken = JWTs.createAccessToken({ userId, role: user.role });

  return accessToken;
};

/**
 * @function verifyAccessToken
 * @description Verifies an access token and returns decoded payload.
 *
 * @param {string} accessToken - Access token string.
 * @returns {{ userId: string; role: string }} Decoded token payload.
 * @throws {Errors.UnauthenticatedError} If token invalid or expired.
 */
export const verifyAccessToken = (accessToken: string): { userId: string; role: string } => {
  try {
    return JWTs.verifyAccessToken(accessToken);
  } catch {
    throw new Errors.UnauthenticatedError('Invalid or expired authentication token');
  }
};

export default {
  registerUser, // Creates user in DB, ensures unique email/username, hashes password, returns sanitized user
  loginUser, // Finds user by email/username, validates password, returns sanitized user
  refreshAccessToken, // Validates refresh token, ensures user exists, issues new access token
  verifyAccessToken, // Verifies access token and returns decoded payload
};
