import { Request } from 'express';
import { UnauthenticatedError } from '@/error/customErrors';

/**
 * Type guard function to ensure the request contains an authenticated user.
 *
 * This function **narrows the type** of `req` within its scope, so after calling `assertAuth(req)`,
 * TypeScript knows for sure that `req.user` exists and is properly typed.
 *
 * 💡 Use this at the beginning of your controllers when you need to access `req.user`
 * without having to do repetitive null-checks.
 *
 * @param req - Express Request object that optionally includes a user field.
 * @throws {UnauthenticatedError} if the user is not authenticated (i.e., `req.user` is undefined).
 *
 * @example
 * ```typescript
 * export const someController = (req: Request, res: Response) => {
 *   assertAuth(req); // Now req.user is safely available
 *   const { userId, role } = req.user;
 * }
 * ```
 */
export default function assertAuth(
  req: Request
): asserts req is Request & { user: { userId: string; role: string } } {
  if (!req.user) {
    throw new UnauthenticatedError('User not authenticated');
  }
}
