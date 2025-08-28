import { User } from '@/models';
import { Errors } from '@/error';
import { auth } from '@/middlewares/validators/validations';
import { JWTs, Passwords } from '@/utils';
import { userSanitizers } from '@/sanitizers';

/**
 * Register a new user.
 * Sanitizes input, hashes password, and creates the user record.
 *
 * @param {RegisterInput} userData - Incoming user data from request body.
 * @returns {Promise<SanitizedUser>} - Sanitized user object without sensitive fields.
 * @throws {Errors.BadRequestError} - If email or username already exists.
 */
export const registerUser = async (
  userData: auth.RegisterInput
): Promise<userSanitizers.SanitizedUser> => {
  const { firstName, lastName, username, email, password, address } = userData;

  const existingUsers = await User.find({
    $or: [{ email }, { username }],
  }).select('email username');

  if (existingUsers.length) {
    if (existingUsers.some(u => u.email === email))
      throw new Errors.BadRequestError('Email already exists');
    if (existingUsers.some(u => u.username === username))
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
 * Authenticate user by email or username and password.
 *
 * @param {Object} credentials - Object with loginIdentifier and password.
 * @param {string} credentials.loginIdentifier - Username or email.
 * @param {string} credentials.password - Plain text password to verify.
 * @returns {Promise<SanitizedUser>} - Authenticated user document.
 * @throws {Errors.UnauthenticatedError} - If user not found or password invalid.
 */
export const loginUser = async ({
  loginIdentifier,
  password,
}: auth.LoginInput): Promise<userSanitizers.SanitizedUser> => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);

  const user = await User.findOne(
    isEmail ? { email: loginIdentifier } : { username: loginIdentifier }
  ).select('+password');

  if (!user) throw new Errors.UnauthenticatedError('Invalid credentials');

  const isValid = await Passwords.compareHashedPassword(password, user.password);
  if (!isValid) throw new Errors.UnauthenticatedError('Invalid credentials');

  return userSanitizers.userSanitizer(user);
};

/**
 * Generates a new access token using a valid refresh token.
 *
 * @param {string} refreshToken - Incoming user data from req.user.
 * @returns {string} - Generated access token.
 * @throws {Errors.UnauthenticatedError} - If user object is not found on request.
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  if (!refreshToken) throw new Errors.UnauthenticatedError('Refresh token missing');

  const { userId } = JWTs.verifyRefreshToken(refreshToken);

  const user = await User.findById(userId);
  if (!user) throw new Errors.NotFoundError('User not found');

  const accessToken = JWTs.createAccessToken({
    userId,
    role: user.role,
  });

  return accessToken;
};

export default {
  registerUser, // Registers a new user, hashes password, validates email/username uniqueness, returns sanitized user
  loginUser, // Authenticates user via email or username, validates password, returns sanitized user
  refreshAccessToken, // Verifies refresh token, generates new access token, validates user existence
};
