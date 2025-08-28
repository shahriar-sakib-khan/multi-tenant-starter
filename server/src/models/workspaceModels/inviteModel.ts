import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IInvite extends Document {
  workspace: Types.ObjectId;

  email: string;
  user?: Types.ObjectId | null;
  role: string;
  invitedBy: Types.ObjectId;
  status: 'pending' | 'sent' | 'accepted' | 'declined' | 'expired';
  token: string;
  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

inviteSchema.methods.toJSON = function (): Partial<IInvite> {
  const obj = this.toObject();
  delete obj.__v;

  return obj as Partial<IInvite>;
};

const Invite: Model<IInvite> = mongoose.model<IInvite>('Invite', inviteSchema);
export default Invite;
