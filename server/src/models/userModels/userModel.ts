import mongoose, { Document, Schema, Model } from 'mongoose';

import { roleConstants } from '@/common/constants';

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
  address?: string;
  role: roleConstants.SuperRoleType;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, required: [true, 'Username is required'], unique: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    address: { type: String },
    role: { type: String, enum: roleConstants.SuperRoles, default: 'user' },
  },
  { timestamps: true }
);

/**
 * Instance Method (toJSON override)
 * TypeScript knows `this` is IUser here.
 */
userSchema.methods.toJSON = function (): Partial<IUser> {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;

  obj.id = obj._id;
  delete obj._id;

  return obj as Partial<IUser>;
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
