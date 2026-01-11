# Backend API Documentation

## Authentication & Authorization

### How JWT Authentication Works

1. **Registration/Login**: User provides credentials, server validates and returns a JWT token
2. **Token Storage**: Frontend stores token (typically in localStorage)
3. **Protected Requests**: Frontend sends token in `Authorization: Bearer <token>` header
4. **Middleware Verification**: `protect` middleware verifies token and attaches user to `req.user`
5. **Authorization**: `authorize` middleware checks if user's role matches required roles

### Role-Based Access Control (RBAC)

**Roles:**
- `admin`: Full access to all resources, can manage users
- `manager`: Can create projects and tasks, assign tasks
- `member`: Can view assigned tasks and update their status

**Access Rules:**
- **Users**: Only admins can manage users
- **Projects**: 
  - Admins can see all projects
  - Managers can see projects they created or are members of
  - Members can only see projects they are members of
- **Tasks**:
  - Admins/Managers can create and manage all tasks
  - Members can only view and update tasks assigned to them

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### User Routes (`/api/users`) - Admin Only

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Project Routes (`/api/projects`)

- `GET /api/projects` - Get all projects (filtered by role)
- `GET /api/projects/:id` - Get project by ID with tasks
- `POST /api/projects` - Create project (Admin/Manager)
- `PUT /api/projects/:id` - Update project (Admin/Manager)
- `DELETE /api/projects/:id` - Delete project (Admin/Manager)

### Task Routes (`/api/tasks`)

- `GET /api/tasks` - Get all tasks (filtered by role)
- `GET /api/tasks?projectId=xxx` - Get tasks by project
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Admin/Manager)
- `PUT /api/tasks/:id` - Update task (Members can update status/description)
- `DELETE /api/tasks/:id` - Delete task (Admin/Manager)

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-project-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

3. Start MongoDB (if running locally)

4. Run server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

