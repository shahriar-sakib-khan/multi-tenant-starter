import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import Membership from './membershipModel';

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  createdBy: Types.ObjectId;
  workspaceRoles: { name: string; permissions: string[]; _id?: Types.ObjectId }[];
}

const workspaceSchema: Schema<IWorkspace> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspaceRoles: [
      {
        name: { type: String, required: true },
        permissions: [{ type: String }],
      },
    ],
  },
  { timestamps: true }
);

// Pre-save Hook → Seed with base roles if none provided
workspaceSchema.pre('save', function (next) {
  if (!this.workspaceRoles || this.workspaceRoles.length === 0) {
    this.workspaceRoles = [
      { name: 'admin', permissions: ['manage_workspace', 'invite_users', 'assign_roles'] },
      { name: 'moderator', permissions: ['moderate_content'] },
      { name: 'manager', permissions: ['manage_team'] },
      { name: 'user', permissions: [] },
    ];
  }
  next();
});

// Pre-delete Hook → Remove all workspace memberships
workspaceSchema.pre('findOneAndDelete', async function (next) {
  const workspace = this.getQuery()['_id'];
  await Membership.deleteMany({ workspace: workspace });
  next();
});

workspaceSchema.methods.toJSON = function (): Partial<IWorkspace> {
  const obj = this.toObject();
  delete obj.__v;

  return obj as Partial<IWorkspace>;
};

const Workspace: Model<IWorkspace> = mongoose.model<IWorkspace>('Workspace', workspaceSchema);
export default Workspace;
