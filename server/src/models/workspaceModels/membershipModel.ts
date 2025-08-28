import mongoose, { Schema, Document, Model, Types } from 'mongoose';

import { roleConstants } from '@/common/constants';

export interface IMembership extends Document {
  workspace: Types.ObjectId;

  user: Types.ObjectId;
  workspaceRoles: string[];
  status: roleConstants.WorkspaceStatusType;
  invitedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema: Schema<IMembership> = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspaceRoles: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: roleConstants.WorkspaceStatuses,
      default: 'active',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

membershipSchema.pre('save', function (next) {
  this.workspaceRoles = [...new Set(this.workspaceRoles)]; // deduplicate roles
  next();
});

membershipSchema.methods.toJSON = function (): Partial<IMembership> {
  const obj = this.toObject();
  delete obj.__v;

  return obj as Partial<IMembership>;
};

const Membership: Model<IMembership> = mongoose.model<IMembership>('Membership', membershipSchema);
export default Membership;
