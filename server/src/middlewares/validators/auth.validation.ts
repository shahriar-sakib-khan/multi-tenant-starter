/**
 * @module user.auth.validation
 *
 * @description Zod schemas for user authentication, including registration and login validation.
 */

import { z } from 'zod';

/**
 * RegisterInputSchema
 * @property {string} firstName - Optional, can be added later. Only letters and spaces allowed.
 * @property {string} [lastName] - Optional, can be added later. Only letters and spaces allowed.
 * @property {string} username - Required. 3-30 chars, letters, numbers, underscores, no leading/trailing underscore.
 * @property {string} email - Required. Must be a valid email format.
 * @property {string} password - Required. 8-100 chars, must include at least one number.
 * @property {string} address - Optional, can be added later.
 *
 * @description
 * Zod schema for user registration validation.
 * Validates user input on the server side to enforce business rules.
 */

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: 'First name is required' })
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
      .regex(/^(?!_)(?!.*_$).+$/, { message: 'Username cannot start or end with an underscore' }),

    email: z.email({ message: 'Invalid email format' }),

    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100, { message: 'Password must be less than 100 characters' })
      // .regex(/[a-z]/, { message: 'Password must include at least one lowercase letter' })
      // .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter' })
      // .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
      //   message: 'Password must include at least one special character',
      // })
      // .refine(
      //     val => {
      //         const common = ['password', '123456', 'qwerty', 'letmein'];
      //         return !common.includes(val.toLowerCase());
      //     },
      //     { message: 'Password is too common' }
      // )
      .regex(/[0-9]/, { message: 'Password must include at least one number' }),

    address: z.string().min(1, { message: 'Address is required' }),
  })
  .strict();
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * LoginInputSchema
 * @property {string} loginIdentifier - Required. Must be a valid email or username.
 * @property {string} password - Required.
 *
 * @description
 * Zod schema for login validation.
 * Accepts either username or email as login identifier.
 */
export const loginSchema = z
  .object({
    loginIdentifier: z
      .string()
      .min(1, { message: 'Username or Email is required' })
      .refine(
        val => {
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          const isUsername = /^[a-zA-Z0-9_]{3,30}$/.test(val);
          return isEmail || isUsername;
        },
        { message: 'Invalid username or email format' }
      ),

    password: z.string().min(1, { message: 'Password is required' }),
  })
  .strict();
export type LoginInput = z.infer<typeof loginSchema>;
