/**
 * Global super roles — platform-wide authority
 */
export const SuperRoles = ['user', 'staff', 'ostad'] as const;
export type SuperRoleType = (typeof SuperRoles)[number]; // "user" | "staff" | "ostad"

/**
 * Default workspace roles — scoped per workspace instance
 */
export const DefaultWorkspaceRoles = ['user', 'moderator', 'manager', 'admin'] as const;
export type DefaultWorkspaceRoleType = (typeof DefaultWorkspaceRoles)[number]; // "user" | "moderator" | "manager" | "admin"

/**
 * Workspace status — scoped per workspace instance
 */
export const WorkspaceStatuses = ['active', 'invited'] as const;
export type WorkspaceStatusType = (typeof WorkspaceStatuses)[number]; // "active" | "invited" | "pending"

/**
 * Permissions map per workspace role
 * Use "*" as wildcard to allow all permissions
 */
export const RolePermissions: Record<DefaultWorkspaceRoleType, string[]> = {
  user: ['read-self'],
  moderator: ['read-any', 'edit-any'],
  manager: ['read-any', 'edit-any', 'invite-users'],
  admin: ['*'],
};

/**
 * Permissions map per superRole (global)
 */
export const SuperRolePermissions: Record<SuperRoleType, string[]> = {
  user: ['read-self'],
  staff: ['read-any', 'edit-any', 'manage-workspaces'],
  ostad: ['*'],
};
