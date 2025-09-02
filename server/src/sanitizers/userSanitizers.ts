import { HydratedDocument } from 'mongoose';

import { IUser } from '@/models';
import listSanitizer from './listSanitizer';

/**
 * ----------------- User Sanitizer -----------------
 */
export const userSanitizer = (user: IUser | HydratedDocument<IUser>) => ({
  id: String(user._id),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.username,
  address: user.address ?? null,
  role: user.role,
});
export type SanitizedUser = ReturnType<typeof userSanitizer>;

export const adminUserSanitizer = (user: IUser | HydratedDocument<IUser>) => ({
  id: String(user._id),
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.username,
  address: user.address ?? null,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  //  Other admin-only fields like
  // isActive: user.isActive ?? true,
  // lastLogin: user.lastLogin ?? null,
});
export type AdminSanitizedUser = ReturnType<typeof adminUserSanitizer>;

/**
 * ----------------- User List Sanitizer -----------------
 * Can optionally select only specific fields
 */
export const allUserSanitizer = (
  users: IUser[] | HydratedDocument<IUser>[],
  fields?: (keyof SanitizedUser)[]
) => ({
  users: listSanitizer(users, userSanitizer, fields),
});
export type SanitizedUsers = ReturnType<typeof allUserSanitizer>;
