import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

import { Errors } from '@/error';

//=============================================
// Types
//=============================================

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

//=============================================
// Helper to enforce process.env safety
//=============================================

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

//=============================================
// Create Access Token (short-lived)
//=============================================

export const createAccessToken = (payload: AccessTokenPayload): string => {
  const secret = getEnvVar('JWT_ACCESS_SECRET');
  const expiresIn = getEnvVar('JWT_ACCESS_EXPIRES_IN');

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  } as SignOptions);
};

//=============================================
// Create Refresh Token (long-lived)
//=============================================

export const createRefreshToken = (payload: RefreshTokenPayload): string => {
  const secret = getEnvVar('JWT_REFRESH_SECRET');
  const expiresIn = getEnvVar('JWT_REFRESH_EXPIRES_IN');

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  } as SignOptions);
};

//=============================================
// Verify Access Token
//=============================================

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = getEnvVar('JWT_ACCESS_SECRET');
  const decoded = jwt.verify(token, secret) as JwtPayload;

  const { userId, role } = decoded;
  if (!userId || !role) {
    throw new Errors.UnauthorizedError('Invalid access token');
  }

  return { userId, role };
};

//=============================================
// Verify Refresh Token
//=============================================

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret = getEnvVar('JWT_REFRESH_SECRET');
  const decoded = jwt.verify(token, secret) as JwtPayload;

  const { userId } = decoded;
  if (!userId) {
    throw new Errors.UnauthorizedError('Invalid refresh token');
  }

  return { userId };
};

//=============================================
// Generate Secure Random Token
//=============================================

export const generateCryptoToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
