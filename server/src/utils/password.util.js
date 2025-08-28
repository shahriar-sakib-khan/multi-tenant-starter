import bcryptjs from "bcryptjs";

/**
 * Compare a hashed passwords
 */
export const compareHashedPassword = async (password, hashedPassword) => {
  const isMatch = bcryptjs.compare(password, hashedPassword);
  return isMatch;
};

/**
 * Hash a plain password
 */
export const hashPassword = async (plainPassword) => {
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(plainPassword, salt);
  return hashedPassword;
};
