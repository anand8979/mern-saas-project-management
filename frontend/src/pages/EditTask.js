import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get projectId from location state or from task
  const projectId = location.state?.projectId || task?.project?._id || task?.project;

  useEffect(() => {
    fetchTask();
  }, [id]);

  useEffect(() => {
    const loadProjectAndUsers = async () => {
      if (task) {
        const projId = task.project?._id || task.project;
        let loadedProject = null;
        
        if (projId) {
          loadedProject = await fetchProject(projId);
          if (loadedProject) {
            setProject(loadedProject);
          }
        }
        
        // Fetch users using loaded project (or current project state)
        await fetchUsersForRole(loadedProject || project);
      }
    };
    loadProjectAndUsers();
  }, [task]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTask(id);
      if (response.success) {
        const taskData = response.data;
        setTask(taskData);
        setFormData({
          title: taskData.title,
          description: taskData.description || '',
          assignedTo: taskData.assignedTo?._id || taskData.assignedTo || '',
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate
            ? new Date(taskData.dueDate).toISOString().split('T')[0]
            : '',
        });
      } else {
        setError('Failed to load task');
      }
    } catch (err) {
      setError('Failed to load task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProject = async (projId) => {
    try {
      const response = await projectService.getProject(projId);
      if (response.success) {
        setProject(response.data.project);
        return response.data.project;
      }
    } catch (err) {
      console.error('Failed to load project');
    }
    return null;
  };

  const fetchUsersForRole = async (projectData = null) => {
    try {
      if (user?.role === 'admin') {
        // Admin can assign to any member
        const response = await userService.getUsers();
        if (response.success) {
          setUsers(response.data.filter((u) => u.role === 'member'));
        }
      } else if (user?.role === 'manager') {
        // Manager can assign to project team members
        const currentProject = projectData || project;
        if (currentProject?.teamMembers && currentProject.teamMembers.length > 0) {
          setUsers(currentProject.teamMembers);
        }
      }
    } catch (err) {
      console.error('Failed to load users');
    }
  };

  const fetchUsers = async () => {
    await fetchUsersForRole(project);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate || undefined,
      };

      const response = await taskService.updateTask(id, taskData);
      if (response.success) {
        // Redirect back to project details
        const redirectProjectId = projectId || task?.project?._id || task?.project;
        if (redirectProjectId) {
          navigate(`/projects/${redirectProjectId}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Failed to update task');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await taskService.deleteTask(id);
      if (response.success) {
        // Redirect back to project details
        const redirectProjectId = projectId || task?.project?._id || task?.project;
        if (redirectProjectId) {
          navigate(`/projects/${redirectProjectId}`);
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.message || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Only admin and manager can access this page
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="container">
        <div className="error-message">You are not authorized to edit tasks.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (!task) {
    return <div className="error-message">Task not found</div>;
  }

  return (
    <div className="edit-task">
      <div className="container">
        <div className="page-header">
          <h1>Edit Task</h1>
          <button
            onClick={() => {
              const redirectProjectId = projectId || task?.project?._id || task?.project;
              if (redirectProjectId) {
                navigate(`/projects/${redirectProjectId}`);
              } else {
                navigate('/dashboard');
              }
            }}
            className="btn btn-secondary"
          >
            ← Back to Project
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter task description"
                maxLength="1000"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignedTo">Assign To *</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((userOption) => (
                    <option key={userOption._id} value={userOption._id}>
                      {userOption.name} ({userOption.email || userOption.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Task'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={submitting}
              >
                Delete Task
              </button>
              <button
                type="button"
                onClick={() => {
                  const redirectProjectId = projectId || task?.project?._id || task?.project;
                  if (redirectProjectId) {
                    navigate(`/projects/${redirectProjectId}`);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
