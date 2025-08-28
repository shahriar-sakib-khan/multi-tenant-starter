### Guide for commit messages

# Format

<type>(optional-scope): <short summary (in imperative tone)>

(optional longer description explaining the change)
(optional footer with breaking changes and references)

| **Keyword** | **Meaning / Use Case**                                   |
| ----------- | -------------------------------------------------------- |
| `feat`      | ✅ **Feature**: introduces a new feature                 |
| `fix`       | 🐞 **Bug fix**: fixes a bug                              |
| `docs`      | 📄 **Documentation**: changes to docs only               |
| `style`     | 🎨 **Style**: formatting, no logic change (e.g., spaces) |
| `refactor`  | ♻️ **Refactor**: code change without feature or bug      |
| `perf`      | 🚀 **Performance**: improves performance                 |
| `test`      | ✅ **Tests**: adds or fixes tests                        |
| `chore`     | 🔧 **Chores**: maintenance tasks (build, CI config)      |
| `revert`    | ⏪ **Revert**: reverts a previous commit                 |


### Starting the ngrok server (for publicizing local host URL)
cmd
> F:
> cd Dev-tools\ngrok-v3-stable-windows-amd64
# or in one line
> cd /d F:\Dev-tools\ngrok-v3-stable-windows-amd64
# fo ngrok url
> ngrok http 5100

### API end-points

==============================
API Documentation - v1
==============================

Base URL: /api/v1

--------------------------------
Authentication (Auth)
--------------------------------
POST   /auth/register              - Register a new user (Public)
POST   /auth/login                 - Log in a user (Public)
POST   /auth/logout                - Log out the current user (Private)
POST   /auth/refresh               - Refresh the access token (Public)

--------------------------------
User
--------------------------------
GET    /user/me                    - Get current user profile (Private)
PATCH  /user/me                    - Update current user profile (Private)

--------------------------------
Admin (Ostad)
--------------------------------
GET    /admin/brands/d             - Get all global brands with details (Ostad only)
POST   /admin/brands               - Add global brand (Ostad only)

--------------------------------
Workspace
--------------------------------
POST   /workspace                  - Create a new workspace (Auth)
GET    /workspace/mine             - Get workspaces owned or joined by user (Auth)
GET    /workspace/:workspaceId     - Get workspace by ID (Admin)
PUT    /workspace/:workspaceId     - Update workspace (Admin)
DELETE /workspace/:workspaceId     - Delete workspace (Admin)
GET    /workspace/:workspaceId/profile - Get user profile in workspace (Auth member)

# Workspace Members
GET    /workspace/:workspaceId/members              - List all members (Member/Admin)
GET    /workspace/:workspaceId/members/:memberId    - Get member (Admin)
DELETE /workspace/:workspaceId/members/:memberId    - Remove member (Admin)

# Workspace Invites
POST   /workspace/:workspaceId/invites/send         - Send invite (Admin)
GET    /workspace/:workspaceId/invites              - Get all invites (Admin)
PUT    /workspace/invites/:token/accept             - Accept invite (Public token)
PUT    /workspace/invites/:token/decline            - Decline invite (Public token)
DELETE /workspace/:workspaceId/invites/:token       - Delete invite (Admin)

# Workspace Roles
GET    /workspace/:workspaceId/roles                - List custom roles (Admin)
POST   /workspace/:workspaceId/roles                - Add custom role (Admin)
PUT    /workspace/:workspaceId/roles/:roleId        - Update role (Admin)
DELETE /workspace/:workspaceId/roles/:roleId        - Delete role (Admin)

# Workspace Role Assignment
POST   /workspace/:workspaceId/roles/:userId/assign/:roleId   - Assign role (Admin)
DELETE /workspace/:workspaceId/roles/:userId/unassign/:roleId - Unassign role (Admin)

--------------------------------
Division (Under Workspace)
--------------------------------
POST   /workspace/:workspaceId/divisions                  - Create division (Division Admin)
GET    /workspace/:workspaceId/divisions                   - List divisions (Auth workspace)
GET    /workspace/:workspaceId/divisions/:divisionId       - Get division (Auth division)
PUT    /workspace/:workspaceId/divisions/:divisionId       - Update division (Division Admin)
DELETE /workspace/:workspaceId/divisions/:divisionId       - Delete division (Division Admin)
GET    /workspace/:workspaceId/divisions/:divisionId/profile - Get user profile in division (Auth division)

# Division Members
GET    /workspace/:workspaceId/divisions/:divisionId/members              - List division members (Auth)
GET    /workspace/:workspaceId/divisions/:divisionId/members/:memberId    - Get division member (Division Admin)
POST   /workspace/:workspaceId/divisions/:divisionId/members              - Add member (Division Admin)
DELETE /workspace/:workspaceId/divisions/:divisionId/members              - Remove member (Division Admin)

# Division Roles
GET    /workspace/:workspaceId/divisions/:divisionId/roles                 - List roles (Division Admin)
POST   /workspace/:workspaceId/divisions/:divisionId/roles                 - Add role (Division Admin)
PUT    /workspace/:workspaceId/divisions/:divisionId/roles/:roleId         - Update role (Division Admin)
DELETE /workspace/:workspaceId/divisions/:divisionId/roles/:roleId         - Delete role (Division Admin)

# Division Role Assignment
POST   /workspace/:workspaceId/divisions/:divisionId/roles/:userId/assign/:roleId   - Assign role (Division Admin)
DELETE /workspace/:workspaceId/divisions/:divisionId/roles/:userId/unassign/:roleId - Unassign role (Division Admin)

--------------------------------
Inventory (Under Division)
--------------------------------
# Brands
GET    /workspace/:workspaceId/divisions/:divisionId/inventory/global-brands - List global brands (Auth)
GET    /workspace/:workspaceId/divisions/:divisionId/inventory/brands        - List local brands (Auth)
GET    /workspace/:workspaceId/divisions/:divisionId/inventory/brands/d      - List detailed local brands (Auth)
PATCH  /workspace/:workspaceId/divisions/:divisionId/inventory/brands        - Select brands (Division Admin)

# Cylinders
GET    /workspace/:workspaceId/divisions/:divisionId/inventory/cylinders     - List all cylinders (Auth)



📌 Notes for Frontend Team
All Private and Admin routes require Authorization: Bearer <access_token> header.

Refresh token is stored in an HTTP-only secure cookie and is automatically sent to backend for /auth/refresh.

workspaceId, memberId, roleId, and userId are path parameters — replace with actual IDs.

Division routes are namespaced under a workspace — always pass workspaceId.

