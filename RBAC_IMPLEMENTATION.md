# RBAC Implementation Summary

## How RBAC is Enforced

### Backend Enforcement (Server-Side)

1. **Authentication Middleware (`protect`)**
   - Verifies JWT token from `Authorization: Bearer <token>` header
   - Attaches user object to `req.user`
   - Returns 401 if token is invalid or missing

2. **Authorization Middleware (`authorize`)**
   - Checks if user's role matches required roles
   - Used in route definitions: `authorize('admin', 'manager')`
   - Returns 403 if user doesn't have required role

3. **Controller-Level Permissions**
   - **Projects**: 
     - `GET /api/projects` - Role-based filtering (members see only their projects)
     - `POST /api/projects` - Only admin/manager can create
     - `PUT/DELETE /api/projects/:id` - Only admin/creator can modify
   
   - **Tasks**:
     - `GET /api/tasks` - Members see only assigned tasks
     - `GET /api/tasks/my-tasks` - Members can fetch their tasks
     - `POST /api/tasks` - Only admin/manager can create
     - `PUT /api/tasks/:id/status` - Members can update status of their own tasks
     - `PUT /api/tasks/:id` - Members can update status/description of their tasks, admins/managers can update all fields
     - `DELETE /api/tasks/:id` - Only admin/manager can delete

4. **Business Logic Validation**
   - Managers can only create tasks in projects they created
   - Members can only update tasks assigned to them
   - Project access is validated in controllers (members must be team members)

### Frontend Enforcement (UI-Level)

1. **Route Protection**
   - `PrivateRoute` - Requires authentication
   - `AdminRoute` - Requires admin role
   - `ManagerRoute` - Requires admin or manager role

2. **Conditional Rendering**
   - Dashboard shows different content based on role
   - Members see `MemberDashboard` (task-focused)
   - Admin/Manager see `Dashboard` (project management)
   - Create buttons only visible to admin/manager

3. **Navigation**
   - Header shows "Create Project" and "Create Task" only for admin/manager
   - "Users" link only visible to admin

## Who Can Assign Tasks and Why

### Admin
- **Can assign to**: Any user (fetches all users via `/api/users`)
- **Can create tasks in**: Any project
- **Why**: Full system access for administration

### Manager
- **Can assign to**: Members of their projects (fetches team members from selected project)
- **Can create tasks in**: Only projects they created
- **Why**: Managers need to assign work within their own projects, but should not assign to users outside their scope

### Member
- **Cannot assign tasks**: No create/assign permissions
- **Can only**: Update status of tasks assigned to them
- **Why**: Members are task executors, not task creators

## Data Flow: Project Creation → Task Assignment → Task Completion

### 1. Project Creation (Admin/Manager)

**Flow:**
```
Admin/Manager → /projects/new → POST /api/projects
  ↓
Backend validates role (authorize middleware)
  ↓
Project created with teamMembers array
  ↓
Project saved to database
  ↓
Returns to Dashboard
```

**Data Structure:**
- Project document contains:
  - `createdBy`: User ID of creator
  - `teamMembers`: Array of user IDs

### 2. Task Assignment (Admin/Manager)

**Flow:**
```
Admin/Manager → /tasks/new → Select Project
  ↓
If Manager: Fetch project details → Get teamMembers
If Admin: Fetch all users → Filter members
  ↓
Select user from dropdown
  ↓
POST /api/tasks
  ↓
Backend validates:
  - Role is admin/manager (authorize middleware)
  - Manager can only create in their projects (controller check)
  ↓
Task created with:
  - project: Project ID
  - assignedTo: User ID
  - status: 'todo'
  ↓
Task saved to database
  ↓
Returns to Dashboard
```

**Key Validation:**
- `createTask` controller checks if manager is project creator
- Only admin can bypass project creator check

### 3. Task Viewing (Member)

**Flow:**
```
Member → Dashboard → GET /api/tasks/my-tasks
  ↓
Backend filters: assignedTo = member.userId
  ↓
Returns only tasks assigned to member
  ↓
MemberDashboard displays tasks
```

### 4. Task Status Update (Member)

**Flow:**
```
Member → Dashboard → Select new status
  ↓
PUT /api/tasks/:id/status { status: 'in-progress' }
  ↓
Backend validates:
  - Task exists
  - Member is assigned to task (assignedTo === member.userId)
  ↓
Task status updated
  ↓
UI updates immediately
```

**Status Transitions:**
- `todo` → `in-progress` → `done`
- Members can only update status, not other fields

## Security Notes

1. **Backend is Source of Truth**: All permissions validated server-side
2. **Frontend is UX Layer**: UI restrictions prevent accidental actions, but backend enforces security
3. **Role Checks Everywhere**: Middleware + Controller-level checks ensure no bypass
4. **HTTP Status Codes**: 
   - 401: Not authenticated
   - 403: Authenticated but not authorized
   - 404: Resource not found
   - 400: Validation error

## Testing the Workflow

1. **As Admin:**
   - Create project → Add team members
   - Create task → Assign to any member
   - View all projects and tasks

2. **As Manager:**
   - Create project → Add team members
   - Create task → Assign to project members only
   - View projects they created

3. **As Member:**
   - View assigned tasks only
   - Update task status (todo → in-progress → done)
   - Cannot create projects or tasks
   - Cannot see other members' tasks
