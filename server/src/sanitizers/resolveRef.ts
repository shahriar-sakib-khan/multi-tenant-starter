import { Types } from 'mongoose';

/**
 * Generic Ref Resolver
 * Handles both ObjectId and populated objects.
 * Returns sanitized object if populated, or string ID if plain ObjectId.
 */
function resolveRef<T extends { _id: any }>(
  ref: Types.ObjectId | T | null | undefined,
  sanitizer: (doc: T) => any
) {
  if (!ref) return null; // null is more semantic than empty string

  // If it's a populated document
  if (typeof ref === 'object' && '_id' in ref && Object.keys(ref).length > 1) {
    return sanitizer(ref as T);
  }

  // If it's a plain ObjectId
  return String(ref);
}

export default resolveRef;
