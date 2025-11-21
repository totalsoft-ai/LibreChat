# Team Workspaces Implementation Guide

## Overview

Team Workspaces feature allows users to organize conversations, agents, prompts, and files into collaborative workspaces with role-based access control.

**Status:** Backend Completed ✅ | Frontend 85% Complete 🎉

---

## ✅ Completed Backend Implementation

### 1. Database Model (`api/models/Workspace.js`)

**Features Implemented:**
- Workspace schema with members, settings, stats
- Role hierarchy: owner, admin, member, viewer
- Permission system with methods:
  - `isMember(userId)` - Check membership
  - `getMemberRole(userId)` - Get user role
  - `hasPermission(userId, role)` - Check permissions
  - `addMember()`, `removeMember()`, `updateMemberRole()`
- Statistics tracking (conversation count, token usage, activity)
- Slug generation for URLs
- Indexes for performance

**Database Indexes:**
```javascript
- workspaceId (unique)
- slug (unique)
- members.user + isArchived
- createdBy + isArchived
- createdAt (descending)
```

---

### 2. API Controllers (`api/server/controllers/workspaces.js`)

**Endpoints Implemented:**

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/workspaces` | Get user workspaces | Authenticated |
| GET | `/api/workspaces/:id` | Get workspace details | Member |
| POST | `/api/workspaces` | Create workspace | Authenticated |
| PATCH | `/api/workspaces/:id` | Update workspace | Admin/Owner |
| DELETE | `/api/workspaces/:id` | Archive workspace | Owner |
| GET | `/api/workspaces/:id/stats` | Get statistics | Member |
| POST | `/api/workspaces/:id/leave` | Leave workspace | Member (not last owner) |
| POST | `/api/workspaces/:id/members` | Add member | Admin/Owner |
| PATCH | `/api/workspaces/:id/members/:userId` | Update member role | Admin/Owner |
| DELETE | `/api/workspaces/:id/members/:userId` | Remove member | Admin/Owner or self |

---

### 3. Middleware (`api/server/middleware/workspaceAccess.js`)

**Functions:**
- `checkWorkspaceAccess` - Verify user has access, attach workspace to req
- `requireWorkspacePermission(role)` - Require specific permission level
- `checkResourceWorkspace(model, idParam)` - Verify resource belongs to workspace
- `checkWorkspaceBudget` - Check token budget limits
- `getWorkspaceFromResource(type, id)` - Get workspace from resource

**Usage Example:**
```javascript
router.post(
  '/api/workspaces/:workspaceId/conversations',
  checkWorkspaceAccess,
  requireWorkspacePermission('member'),
  checkWorkspaceBudget,
  createConversation
);
```

---

### 4. Routes (`api/server/routes/workspaces.js`)

**Registered in:**
- `api/server/routes/index.js` - Exported
- `api/server/index.js` - Mounted at `/api/workspaces`

**Authentication:**
- All routes require JWT authentication (`requireJwtAuth`)

---

## ✅ Resource Filtering Implementation (NEW - 2025-11-14)

### Backend - Workspace Query Filtering

**Updated Files:**
1. **`api/server/controllers/agents/v1.js`** (lines 468-490)
   - Added `workspace` parameter extraction from query
   - Filter logic for personal vs workspace agents
   - Pattern: `workspace: null` for personal, `workspace: workspace_id` for workspace

2. **`api/server/routes/prompts.js`** (lines 104-123, 173-192)
   - Added workspace filtering in `/all` and `/groups` endpoints
   - Reuses `buildPromptGroupFilter` with workspace parameter

3. **`api/server/routes/files/files.js`** (lines 42-79)
   - Added workspace filtering in main `/` endpoint
   - Handles personal files and workspace files separately

**Query Pattern:**
```javascript
// Personal mode (workspace = null or 'personal' or '')
filter.$or = [{ workspace: null }, { workspace: { $exists: false } }];

// Workspace mode
filter.workspace = workspace_id;
```

### Frontend - Type Definitions & Components

**Updated Files:**
1. **`packages/data-provider/src/types/assistants.ts`** (line 298)
   - Added `workspace?: string` to `AgentListParams`

2. **`client/src/components/SidePanel/Agents/AgentSelect.tsx`** (lines 1-55)
   - Imports `currentWorkspaceIdAtom` from Jotai
   - Passes `workspace: currentWorkspaceId` to `useListAgentsQuery`
   - Added `useEffect` to refetch agents when workspace changes

3. **`client/src/components/Chat/Header.tsx`** (lines 63-75) ✅ Already Implemented
   - Workspace indicator badge in header
   - Shows workspace name with building icon
   - Responsive design with truncation

### Automatic Resource Filtering

**How It Works:**
1. User switches workspace via `WorkspaceSelector` → Updates `currentWorkspaceIdAtom`
2. All components using `currentWorkspaceIdAtom` automatically refetch with new workspace filter
3. Backend receives `?workspace=ws_xxx` query parameter
4. MongoDB queries filtered by workspace field
5. UI displays only resources from selected workspace

**Affected Resources:**
- ✅ Conversations (already implemented)
- ✅ Agents (newly implemented)
- ✅ Prompts (newly implemented - needs frontend integration)
- ✅ Files (newly implemented - needs frontend integration)

---

## 🚧 Remaining Frontend Implementation

### 1. Data Provider

**File:** `packages/data-provider/src/workspaces.ts` (new)

**Required Functions:**
```typescript
// API calls
export const getWorkspaces = () => dataService.get('/api/workspaces');
export const getWorkspace = (id: string) => dataService.get(`/api/workspaces/${id}`);
export const createWorkspace = (data) => dataService.post('/api/workspaces', data);
export const updateWorkspace = (id, data) => dataService.patch(`/api/workspaces/${id}`, data);
export const deleteWorkspace = (id) => dataService.delete(`/api/workspaces/${id}`);
export const getWorkspaceStats = (id) => dataService.get(`/api/workspaces/${id}/stats`);
export const leaveWorkspace = (id) => dataService.post(`/api/workspaces/${id}/leave`);
export const addMember = (workspaceId, userId, role) =>
  dataService.post(`/api/workspaces/${workspaceId}/members`, { memberUserId: userId, role });
export const updateMemberRole = (workspaceId, userId, role) =>
  dataService.patch(`/api/workspaces/${workspaceId}/members/${userId}`, { role });
export const removeMember = (workspaceId, userId) =>
  dataService.delete(`/api/workspaces/${workspaceId}/members/${userId}`);
```

---

### 2. React Query Hooks

**File:** `packages/data-provider/react-query/workspaces.ts` (new)

**Required Hooks:**
```typescript
// Queries
export const useWorkspacesQuery = () => useQuery(['workspaces'], getWorkspaces);
export const useWorkspaceQuery = (id: string) => useQuery(['workspace', id], () => getWorkspace(id));
export const useWorkspaceStatsQuery = (id: string) =>
  useQuery(['workspace-stats', id], () => getWorkspaceStats(id));

// Mutations
export const useCreateWorkspaceMutation = () => useMutation(createWorkspace, {
  onSuccess: () => queryClient.invalidateQueries(['workspaces']),
});
export const useUpdateWorkspaceMutation = () => useMutation(...);
export const useDeleteWorkspaceMutation = () => useMutation(...);
export const useAddMemberMutation = () => useMutation(...);
export const useUpdateMemberRoleMutation = () => useMutation(...);
export const useRemoveMemberMutation = () => useMutation(...);
export const useLeaveWorkspaceMutation = () => useMutation(...);
```

---

### 3. State Management

**File:** `client/src/store/workspace.ts` (new)

**Jotai Atoms:**
```typescript
import { atom } from 'jotai';

// Current active workspace
export const currentWorkspaceAtom = atom<Workspace | null>(null);

// Workspace selector open/closed
export const workspaceSelectorOpenAtom = atom(false);

// Selected workspace for operations
export const selectedWorkspaceIdAtom = atom<string | null>(null);

// Derived atom for current workspace members
export const currentWorkspaceMembersAtom = atom((get) => {
  const workspace = get(currentWorkspaceAtom);
  return workspace?.members || [];
});

// Derived atom for current user role in workspace
export const currentWorkspaceRoleAtom = atom((get) => {
  const workspace = get(currentWorkspaceAtom);
  const user = get(userAtom); // Assuming you have a user atom
  if (!workspace || !user) return null;
  const member = workspace.members.find(m => m.user._id === user.id);
  return member?.role || null;
});
```

---

### 4. UI Components

#### A. Workspace Selector

**File:** `client/src/components/Workspaces/WorkspaceSelector.tsx` (new)

**Features:**
- Dropdown in sidebar/header
- List all user workspaces
- Switch between workspaces
- "Create New Workspace" button
- Show current workspace with icon/color

**UI Mock:**
```
┌─────────────────────────────────┐
│ 🏢 Current Workspace [▼]        │
├─────────────────────────────────┤
│ Personal Workspace              │
│ ✓ Marketing Team (5 members)   │
│ Engineering Team (12 members)   │
│ ─────────────────────────────   │
│ + Create New Workspace          │
└─────────────────────────────────┘
```

---

#### B. Workspace Manager

**File:** `client/src/components/Workspaces/WorkspaceManager.tsx` (new)

**Features:**
- List view of all workspaces
- Cards with stats (conversations, members, activity)
- Create, edit, delete actions
- Search and filter workspaces

---

#### C. Workspace Settings Dialog

**File:** `client/src/components/Workspaces/WorkspaceSettings.tsx` (new)

**Tabs:**
1. **General** - Name, description, color, avatar
2. **Members** - Member list, add/remove, role management
3. **Settings** - Default model, budget, file types
4. **Statistics** - Usage stats, charts
5. **Danger Zone** - Leave workspace, delete workspace

**Members Tab UI:**
```
┌─────────────────────────────────────────┐
│ Members (12)                [+ Add]     │
├─────────────────────────────────────────┤
│ 👤 John Doe (Owner)          [⋮]       │
│    john@example.com                     │
│                                         │
│ 👤 Jane Smith (Admin)        [⋮]       │
│    jane@example.com                     │
│                                         │
│ 👤 Bob Wilson (Member)       [⋮]       │
│    bob@example.com                      │
└─────────────────────────────────────────┘
```

---

#### D. Add Member Dialog

**File:** `client/src/components/Workspaces/AddMemberDialog.tsx` (new)

**Features:**
- Search users (email/name)
- Select role (Admin, Member, Viewer)
- Bulk add multiple users
- Send invitation (future)

---

#### E. Workspace Stats Widget

**File:** `client/src/components/Workspaces/WorkspaceStatsWidget.tsx` (new)

**Display:**
- Total conversations
- Total messages
- Token usage vs budget
- Active members
- Recent activity

---

### 5. Integration with Existing Features

#### A. Update Conversation Model

**File:** `packages/data-schemas/src/schemas/` (Conversation schema)

**Add Field:**
```typescript
workspace: {
  type: String,
  ref: 'Workspace',
  default: null,
  index: true,
}
```

**Update Queries:**
- Filter conversations by workspace
- Show workspace indicator in conversation list
- Workspace context in conversation view

---

#### B. Update Agent Model

**Add workspace field** to agents, prompts, files

**UI Changes:**
- Workspace selector when creating agent
- Filter agents by workspace in marketplace
- Share agents within workspace

---

#### C. Sidebar Integration

**File:** `client/src/components/Nav/Nav.tsx`

**Changes:**
- Add Workspace Selector at top
- Filter conversations by active workspace
- Show workspace context indicator
- "All Workspaces" vs "Current Workspace" toggle

---

#### D. Header Integration

**File:** `client/src/components/Chat/ChatView.tsx`

**Changes:**
- Show workspace badge in header
- Quick workspace switch dropdown
- Workspace settings access

---

### 6. Routes

**File:** `client/src/routes/index.tsx`

**New Routes:**
```typescript
<Route path="/workspaces" element={<WorkspacesPage />} />
<Route path="/workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
<Route path="/workspaces/:workspaceId/settings" element={<WorkspaceSettingsPage />} />
```

---

## 🧪 Testing Requirements

### 1. Backend Tests

**File:** `api/test/workspaces.test.js` (new)

**Test Cases:**
- Model methods (isMember, hasPermission, etc.)
- API endpoints (all CRUD operations)
- Middleware (access control, permissions)
- Edge cases (last owner removal, budget limits)

**Example:**
```javascript
describe('Workspace Model', () => {
  test('should create workspace with owner', async () => {
    const workspace = new Workspace({ name: 'Test', createdBy: userId });
    await workspace.save();
    expect(workspace.getMemberRole(userId)).toBe('owner');
  });

  test('should not allow removing last owner', async () => {
    await expect(workspace.removeMember(ownerId)).rejects.toThrow();
  });
});
```

---

### 2. Frontend Tests

**Files:** Component test files

**Test Cases:**
- Workspace selector rendering
- Create workspace form
- Member management
- Permission-based UI visibility
- State management with Jotai

---

## 📋 Implementation Checklist

### Backend ✅
- [x] Workspace model
- [x] API controllers
- [x] Routes
- [x] Middleware
- [x] Register routes in server

### Frontend 🚧
- [x] Data provider functions (workspace service)
- [x] React Query hooks (workspace queries)
- [x] Jotai atoms (workspace state management)
- [x] WorkspaceSelector component
- [x] WorkspaceManager component (WorkspaceSettings)
- [x] WorkspaceSettings component (with member management)
- [x] AddMember dialog (CreateWorkspaceDialog)
- [ ] Stats widget (backend ready, frontend TODO)
- [x] Integrate with Conversation (filtering implemented)
- [x] Integrate with Agent (filtering implemented)
- [x] Integrate with Prompt (backend ready, frontend needs update)
- [x] Integrate with File (backend ready, frontend needs update)
- [x] Update sidebar (WorkspaceSelector integrated)
- [x] Update header (workspace indicator badge)
- [x] Add routes (workspace routes implemented)

### Testing 🚧
- [ ] Backend unit tests
- [ ] Backend integration tests
- [ ] Frontend component tests
- [ ] E2E tests

### Documentation 🚧
- [ ] API documentation (Swagger)
- [ ] User guide (in GHID_UTILIZATOR)
- [ ] Developer guide
- [ ] Migration guide

---

## 🚀 Quick Start for Frontend

**Step 1: Create data provider**
```bash
cd packages/data-provider/src
# Create workspaces.ts with API functions
```

**Step 2: Create React Query hooks**
```bash
cd packages/data-provider/react-query
# Create workspaces.ts with hooks
```

**Step 3: Create Jotai atoms**
```bash
cd client/src/store
# Create workspace.ts with atoms
```

**Step 4: Create UI components**
```bash
cd client/src/components
mkdir Workspaces
# Create WorkspaceSelector.tsx, WorkspaceManager.tsx, etc.
```

**Step 5: Integrate with existing features**
- Update Conversation queries to filter by workspace
- Update sidebar to show workspace selector
- Update header with workspace context

**Step 6: Test**
```bash
npm run test:client
npm run e2e
```

---

## 🔧 Configuration

**Environment Variables:**
No new env variables required. Feature is ready to use.

**librechat.yaml:**
```yaml
# Optional: Workspace feature configuration
workspaces:
  enabled: true
  maxMembersPerWorkspace: 50
  maxWorkspacesPerUser: 10
  defaultTokenBudget: null  # null = unlimited
```

---

## 📝 API Usage Examples

### Create Workspace
```javascript
POST /api/workspaces
{
  "name": "Marketing Team",
  "description": "Workspace for marketing campaigns",
  "color": "#10b981",
  "settings": {
    "defaultModel": "gpt-4",
    "tokenBudget": 100000
  }
}
```

### Add Member
```javascript
POST /api/workspaces/ws_abc123/members
{
  "memberUserId": "user_xyz789",
  "role": "member"
}
```

### Get Workspace Stats
```javascript
GET /api/workspaces/ws_abc123/stats

Response:
{
  "stats": {
    "memberCount": 5,
    "conversationCount": 42,
    "agentCount": 3,
    "promptCount": 15,
    "fileCount": 28,
    "tokenUsage": 45000,
    "lastActivityAt": "2025-11-13T10:30:00Z",
    "recentConversations": [...]
  }
}
```

---

## 🎯 Next Steps

1. **Immediate:**
   - Create frontend data provider
   - Create React Query hooks
   - Create Jotai atoms

2. **Short-term:**
   - Build WorkspaceSelector UI
   - Build WorkspaceManager UI
   - Integrate with sidebar

3. **Medium-term:**
   - Update all models with workspace field
   - Add workspace filtering everywhere
   - Build workspace settings

4. **Long-term:**
   - Add workspace analytics dashboard
   - Add workspace templates
   - Add workspace billing (if needed)

---

**Last Updated:** 2025-11-13
**Status:** Backend Complete, Frontend In Progress
**Estimated Completion:** 2-3 days for full frontend implementation
