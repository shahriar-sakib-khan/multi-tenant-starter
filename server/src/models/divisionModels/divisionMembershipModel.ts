import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDivisionMembership extends Document {
  workspace: Types.ObjectId;
  division: Types.ObjectId;

  user: Types.ObjectId;
  divisionRoles: string[];
  status: 'active' | 'invited' | 'removed';
  invitedBy?: Types.ObjectId | null;
  removedBy?: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const divisionMembershipSchema: Schema<IDivisionMembership> = new Schema(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    division: {
      type: Schema.Types.ObjectId,
      ref: 'Division',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    divisionRoles: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'invited'],
      default: 'active',
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

divisionMembershipSchema.pre('save', function (next) {
  this.divisionRoles = [...new Set(this.divisionRoles)]; // deduplicate roles
  next();
});

divisionMembershipSchema.methods.toJSON = function (): Partial<IDivisionMembership> {
  const obj = this.toObject();
  delete obj.__v;

  return obj as Partial<IDivisionMembership>;
};

const DivisionMembership: Model<IDivisionMembership> = mongoose.model<IDivisionMembership>(
  'DivisionMembership',
  divisionMembershipSchema
);
export default DivisionMembership;
