/**
 * @module user.validation
 *
 * @description Zod schema for updating user information.
 * Validates input on the server side while allowing partial updates.
 */
import { z } from 'zod';

import { roleConstants } from '@/common';

/**
 * UpdateUserInputSchema
 * @property {string} [firstName] - Optional. Only letters and spaces allowed.
 * @property {string} [lastName] - Optional. Only letters and spaces allowed.
 * @property {string} [username] - Optional. 3-30 chars, letters, numbers, underscores, no leading/trailing underscore.
 * @property {string} [email] - Optional. Must be a valid email format.
 * @property {string} [password] - Optional. 8-100 chars, must include at least one number.
 * @property {string} [address] - Optional.
 * @property {string} [role] - Optional. Must be one of the defined super roles.
 *
 * @description
 * Zod schema for validating user update input.
 * All fields are optional to allow partial updates.
 */
export const updateUserSchema = z
  .object({
    firstName: z
      .string()
      .regex(/^[A-Za-z\s]+$/, { message: 'First name must contain only letters and spaces' })
      .optional(),

    lastName: z
      .string()
      .regex(/^[A-Za-z\s]+$/, { message: 'Last name must contain only letters and spaces' })
      .optional(),

    username: z
      .string()
      .min(3, { message: 'Username must be between 3 and 30 characters' })
      .max(30, { message: 'Username must be between 3 and 30 characters' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can contain only letters, numbers, and underscores',
      })
      .regex(/^(?!_)(?!.*_$).+$/, { message: 'Username cannot start or end with an underscore' })
      .optional(),

    email: z.string().email({ message: 'Invalid email format' }).optional(),

    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100, { message: 'Password must be less than 100 characters' })
      .regex(/[0-9]/, { message: 'Password must include at least one number' })
      .optional(),

    address: z.string().optional(),
  })
  .strict();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserAdminSchema = updateUserSchema
  .extend({
    role: z.enum(roleConstants.SuperRoles).optional(),
    // add any other admin-only fields here like
    // isActive: z.boolean().optional(),
    // lastLogin: z.date().optional(),
  })
  .strict();
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
