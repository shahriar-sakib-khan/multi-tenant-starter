import { HydratedDocument } from 'mongoose';

/**
 * ----------------- Generic List Sanitizer -----------------
 * Maps any array of documents through a sanitizer.
 * Optionally, only returns selected fields from the sanitized object.
 */
const listSanitizer = <T, U extends object>(
  items: T[] | HydratedDocument<T>[],
  sanitizer: (doc: T) => U,
  fields?: (keyof U)[]
): Partial<U>[] => {
  return items.map(item => {
    const sanitized = sanitizer(item);

    if (!fields) return sanitized; // return full sanitized object if no field selection

    const picked: Partial<U> = {};
    for (const key of fields) {
      picked[key] = sanitized[key];
    }
    return picked;
  });
};

export default listSanitizer;
