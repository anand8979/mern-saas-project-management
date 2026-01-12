import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const CreateTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
  });
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        projectService.getProjects(),
        user?.role === 'admin' ? userService.getUsers() : Promise.resolve({ success: false }),
      ]);

      if (projectsRes.success) {
        setProjects(projectsRes.data);
      }

      // Only admin can fetch all users
      if (usersRes.success && user?.role === 'admin') {
        setUsers(usersRes.data.filter((u) => u.role === 'member'));
      }
      // Managers will get users from selected project's team members
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
  };

  const handleProjectChange = async (projectId) => {
    setFormData({ ...formData, project: projectId, assignedTo: '' });
    setUsers([]);

    if (!projectId) return;

    try {
      const response = await projectService.getProject(projectId);
      if (response.success && response.data.project.teamMembers) {
        // Use team members from the selected project
        setUsers(response.data.project.teamMembers);
      }
    } catch (err) {
      console.error('Failed to load project details');
    }
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
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate || undefined,
      };

      const response = await taskService.createTask(taskData);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to create task');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only admin and manager can access this page (route protection)
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="container">
        <div className="error-message">You are not authorized to create tasks.</div>
      </div>
    );
  }

  return (
    <div className="create-task">
      <div className="container">
        <div className="page-header">
          <h1>Create New Task</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
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
                <label htmlFor="project">Project *</label>
                <select
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={(e) => {
                    handleProjectChange(e.target.value);
                  }}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
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
                      {userOption.name} ({userOption.email})
                    </option>
                  ))}
                </select>
              </div>
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
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
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

export default CreateTask;
