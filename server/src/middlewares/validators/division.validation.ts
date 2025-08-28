/**
 * @module division.validation
 *
 * @description Zod schemas for division management, including division creation, member management, and role validation.
 */
import { z } from 'zod';

/**
 * DivisionInputSchema
 * @property {string} name - Required. Must be between 3 and 50 characters.
 * @property {string} [description] - Optional. Must be less than 200 characters.
 *
 * @description
 * Zod schema for division validation.
 * Validates user input on the server side to enforce business rules.
 */
export const divisionSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: 'Division name must be at least 3 characters' })
      .max(50, { message: 'Division name must be less than 50 characters' })
      .regex(/^[A-Za-z0-9\s_-]+$/, {
        message:
          'Division name can only include letters, numbers, spaces, hyphens, and underscores',
      }),
    description: z
      .string()
      .max(200, { message: 'Description must be less than 200 characters' })
      .optional(),
  })
  .strict();
export type DivisionInput = z.infer<typeof divisionSchema>;

/**
 * DivisionMemberInputSchema
 * @property {string} memberIdentifier - Required. Must be a valid user identifier.
 *
 * @description
 * Zod schema for division member validation.
 * Validates user input on the server side to enforce business rules.
 */
export const divisionMemberSchema = z
  .object({
    memberIdentifier: z.string().min(1, { message: 'User identifier is required' }),
  })
  .strict();
export type DivisionMemberInput = z.infer<typeof divisionMemberSchema>;

/**
 * DivisionRoleInputSchema
 * @property {string} name - Required. Must be between 3 and 50 characters.
 * @property {string[]} permissions - Required. At least one permission is required.
 *
 * @description
 * Zod schema for division role validation.
 * Validates user input on the server side to enforce business rules.
 */
export const divisionRoleSchema = z
  .object({
    name: z.string().min(1, { message: 'Role name is required' }),
    permissions: z.array(z.string()).min(1, { message: 'At least one permission is required' }),
  })
  .strict();
export type DivisionRoleInput = z.infer<typeof divisionRoleSchema>;

/**
 * DivisionUpdateRoleInputSchema
 * @property {string} [name] - Optional.
 * @property {string[]} [permissions] - Optional.
 *
 * @description
 * Zod schema for division update role validation.
 * Validates user input on the server side to enforce business rules.
 */
export const divisionUpdateRoleSchema = z
  .object({
    name: z.string().min(1, { message: 'Role name is required' }).optional(),
    permissions: z
      .array(z.string())
      .min(1, { message: 'At least one permission is required' })
      .optional(),
  })
  .strict();
export type DivisionUpdateRoleInput = z.infer<typeof divisionUpdateRoleSchema>;
