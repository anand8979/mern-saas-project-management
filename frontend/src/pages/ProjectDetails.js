import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });

  useEffect(() => {
    fetchProject();
  }, [id, user]);

  useEffect(() => {
    // Fetch users after project is loaded
    if (project && (user?.role === 'admin' || user?.role === 'manager')) {
      fetchUsers();
    }
  }, [project, user]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(id);
      if (response.success) {
        setProject(response.data.project);
        setTasks(response.data.tasks || []);
      } else {
        setError('Failed to load project');
      }
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      if (user?.role === 'admin') {
        // Admin can fetch all users
        const response = await userService.getUsers();
        if (response.success) {
          setAllUsers(response.data);
        }
      } else if (user?.role === 'manager') {
        // Manager can only use project team members
        if (project?.teamMembers && project.teamMembers.length > 0) {
          setAllUsers(project.teamMembers);
        }
      }
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const handleTaskFormChange = (e) => {
    setTaskFormData({
      ...taskFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...taskFormData,
        project: id,
        dueDate: taskFormData.dueDate || undefined,
      };

      const response = await taskService.createTask(taskData);
      if (response.success) {
        setShowTaskForm(false);
        setTaskFormData({
          title: '',
          description: '',
          status: 'todo',
          assignedTo: '',
          priority: 'medium',
          dueDate: '',
        });
        fetchProject();
      } else {
        setError(response.message || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await projectService.deleteProject(id);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to delete project');
      }
    } catch (err) {
      setError('Failed to delete project');
      console.error(err);
    }
  };

  const handleEditProject = () => {
    // Navigate to EditProject page
    navigate(`/projects/${id}/edit`);
  };

  const handleEditTask = (task) => {
    // Navigate to EditTask page with projectId in state
    navigate(`/tasks/${task._id}/edit`, {
      state: { projectId: id },
    });
  };


  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await taskService.deleteTask(taskId);
      if (response.success) {
        fetchProject();
      } else {
        setError(response.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (!project) {
    return <div className="error-message">Project not found</div>;
  }

  const canEdit = user?.role === 'admin' || project.createdBy?._id === user?.id;

  return (
    <div className="project-details">
      <div className="container">
        <div className="project-header">
          <div>
            <Link to="/dashboard" className="btn btn-secondary">
              ← Back to Dashboard
            </Link>
            <h1>{project.name}</h1>
            <p className="project-description-full">{project.description || 'No description'}</p>
            <div className="project-info">
              <span>Created by: {project.createdBy?.name || 'Unknown'}</span>
              <span>Team members: {project.teamMembers?.length || 0}</span>
            </div>
          </div>
          <div className="project-actions">
            <Link
              to={`/projects/${id}/kanban`}
              className="btn btn-primary"
            >
              View Kanban Board
            </Link>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <button onClick={handleEditProject} className="btn btn-primary">
                  Edit Project
                </button>
                {canEdit && (
                  <button onClick={handleDeleteProject} className="btn btn-danger">
                    Delete Project
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Create Task Form */}
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="card">
            {!showTaskForm ? (
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn btn-primary"
              >
                + Add New Task
              </button>
            ) : (
              <form onSubmit={handleCreateTask}>
                <h3>Create New Task</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={taskFormData.description}
                    onChange={handleTaskFormChange}
                    rows="3"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={taskFormData.status}
                      onChange={handleTaskFormChange}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={taskFormData.priority}
                      onChange={handleTaskFormChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assign To</label>
                    <select
                      name="assignedTo"
                      value={taskFormData.assignedTo}
                      onChange={handleTaskFormChange}
                      required
                    >
                      <option value="">Select user</option>
                      {allUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={taskFormData.dueDate}
                      onChange={handleTaskFormChange}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Create Task
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tasks List */}
        <div className="tasks-section">
          <h2>Tasks ({tasks.length})</h2>
          {tasks.length === 0 ? (
            <div className="empty-state">No tasks yet.</div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    <div className="task-badges">
                      <span className={`task-status task-status-${task.status}`}>
                        {task.status}
                      </span>
                      <span className={`task-priority task-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-card-meta">
                    <span>Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                    {task.dueDate && (
                      <span>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <div className="task-card-actions">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="btn btn-primary btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
