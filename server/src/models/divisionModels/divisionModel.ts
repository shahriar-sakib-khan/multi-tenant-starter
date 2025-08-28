import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import DivisionMembership from './divisionMembershipModel';

export interface IDivision extends Document {
  workspace: Types.ObjectId;

  name: string;
  description?: string;
  divisionRoles: { name: string; permissions: string[]; _id?: Types.ObjectId }[];
  createdBy: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const divisionSchema: Schema<IDivision> = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    name: { type: String, required: [true, 'Division name is required'], trim: true },
    description: { type: String, default: '' },
    divisionRoles: [{ name: { type: String, required: true }, permissions: [{ type: String }] }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Pre-save Hook → Seed with base roles if none provided
divisionSchema.pre('save', function (next) {
  if (!this.divisionRoles || this.divisionRoles.length === 0) {
    this.divisionRoles = [
      { name: 'division_admin', permissions: ['manage_division', 'assign_roles'] },
      { name: 'division_member', permissions: [] },
    ];
  }
  next();
});

// Pre-delete Hook → Remove all division memberships
divisionSchema.pre('findOneAndDelete', async function (next) {
  const division = this.getQuery()['_id'];
  await DivisionMembership.deleteMany({ division: division });
  next();
});

divisionSchema.methods.toJSON = function (): Partial<IDivision> {
  const obj = this.toObject();
  delete obj.__v;

  return obj as Partial<IDivision>;
};

const Division: Model<IDivision> = mongoose.model<IDivision>('Division', divisionSchema);
export default Division;
