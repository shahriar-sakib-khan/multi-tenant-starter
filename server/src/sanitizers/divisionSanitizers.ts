import { HydratedDocument } from 'mongoose';

import { IDivision, IDivisionMembership } from '@/models';
import resolveRef from './resolveRef';
import listSanitizer from './listSanitizer';
import { userSanitizer } from './userSanitizers';
import { workspaceSanitizer } from './workspaceSanitizers';

/**
 * ----------------- Division -----------------
 */
export const divisionSanitizer = (division: IDivision | HydratedDocument<IDivision>) => ({
  id: String(division._id),
  name: division.name,
  description: division.description ?? null,
  workspace: resolveRef(division.workspace ?? null, workspaceSanitizer),
  createdBy: resolveRef(division.createdBy ?? null, userSanitizer),
  divisionRoles: division.divisionRoles ?? [],
});

export type SanitizedDivision = ReturnType<typeof divisionSanitizer>;

/**
 * ----------------- Division List -----------------
 * Can optionally select only specific fields
 */
export const allDivisionSanitizer = (
  divisions: IDivision[] | HydratedDocument<IDivision>[],
  fields?: (keyof SanitizedDivision)[]
) => ({
  divisions: listSanitizer(divisions, divisionSanitizer, fields),
});

export type SanitizedDivisions = ReturnType<typeof allDivisionSanitizer>;

/**
 * ----------------- Division Membership -----------------
 */
export const divisionMembershipSanitizer = (
  membership: IDivisionMembership | HydratedDocument<IDivisionMembership>
) => ({
  id: String(membership._id),
  divisionRoles: membership.divisionRoles ?? [],
  status: membership.status,
  user: resolveRef(membership.user ?? null, userSanitizer),
  division: resolveRef(membership.division ?? null, divisionSanitizer),
  workspace: resolveRef(membership.workspace ?? null, workspaceSanitizer),
  invitedBy: resolveRef(membership.invitedBy ?? null, userSanitizer),
});

export type SanitizedDivisionMembership = ReturnType<typeof divisionMembershipSanitizer>;

/**
 * ----------------- Division Members -----------------
 * Can optionally select only specific fields
 */
export const divisionMembersSanitizer = (
  members: IDivisionMembership[] | HydratedDocument<IDivisionMembership>[],
  fields?: (keyof SanitizedDivisionMembership)[]
) => ({
  members: listSanitizer(members, divisionMembershipSanitizer, fields),
});

export type SanitizedDivisionMembers = ReturnType<typeof divisionMembersSanitizer>;
