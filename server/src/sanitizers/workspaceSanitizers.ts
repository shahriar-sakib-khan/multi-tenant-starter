import { HydratedDocument } from 'mongoose';

import { IMembership, IWorkspace, IInvite } from '@/models';
import resolveRef from './resolveRef';
import listSanitizer from './listSanitizer';
import { userSanitizer } from './userSanitizers';

/**
 * ----------------- Workspace -----------------
 */
export const workspaceSanitizer = (workspace: IWorkspace | HydratedDocument<IWorkspace>) => ({
  id: String(workspace._id),
  name: workspace.name,
  description: workspace.description ?? null,
  createdBy: resolveRef(workspace.createdBy ?? null, userSanitizer),
  workspaceRoles: workspace.workspaceRoles ?? [],
});

export type SanitizedWorkspace = ReturnType<typeof workspaceSanitizer>;

/**
 * ----------------- Workspace List -----------------
 * Can optionally select only specific fields
 */
export const allWorkspaceSanitizer = (
  workspaces: IWorkspace[] | HydratedDocument<IWorkspace>[],
  fields?: (keyof SanitizedWorkspace)[]
) => ({
  workspaces: listSanitizer(workspaces, workspaceSanitizer, fields),
});

export type SanitizedWorkspaces = ReturnType<typeof allWorkspaceSanitizer>;

/**
 * ----------------- Membership -----------------
 */
export const membershipSanitizer = (membership: IMembership | HydratedDocument<IMembership>) => ({
  id: String(membership._id),
  workspaceRoles: membership.workspaceRoles ?? [],
  status: membership.status,
  user: resolveRef(membership.user ?? null, userSanitizer),
  workspace: resolveRef(membership.workspace ?? null, workspaceSanitizer),
  invitedBy: resolveRef(membership.invitedBy ?? null, userSanitizer),
});

export type SanitizedMembership = ReturnType<typeof membershipSanitizer>;

/**
 * ----------------- Workspace Invite -----------------
 */
export const workspaceInviteSanitizer = (invite: IInvite | HydratedDocument<IInvite>) => ({
  id: String(invite._id),
  role: invite.role,
  status: invite.status,
  email: invite.email,
  token: invite.token,
});

export type SanitizedWorkspaceInvite = ReturnType<typeof workspaceInviteSanitizer>;

/**
 * ----------------- Workspace Invite List -----------------
 * Can optionally select only specific fields
 */
export const allWorkspaceInviteSanitizer = (
  invites: IInvite[] | HydratedDocument<IInvite>[],
  fields?: (keyof SanitizedWorkspaceInvite)[]
) => ({
  invites: listSanitizer(invites, workspaceInviteSanitizer, fields),
});

export type SanitizedWorkspaceInvites = ReturnType<typeof allWorkspaceInviteSanitizer>;
