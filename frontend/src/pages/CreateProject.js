import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamMembers: [],
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only admin can assign any users, managers can assign members
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Only admin can fetch users (managers will have empty list)
      // Team members can be added later via project edit
      if (user?.role === 'admin') {
        const response = await userService.getUsers();
        if (response.success) {
          setAllUsers(response.data);
        }
      }
      // Managers: Leave teamMembers empty, can be added later
    } catch (err) {
      console.error('Failed to load users');
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

  const handleTeamMemberChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({
      ...formData,
      teamMembers: selectedOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await projectService.createProject(formData);
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to create project');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Only admin and manager can access this page (route protection)
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="container">
        <div className="error-message">You are not authorized to create projects.</div>
      </div>
    );
  }

  return (
    <div className="create-project">
      <div className="container">
        <div className="page-header">
          <h1>Create New Project</h1>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            ← Back to Dashboard
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Project Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter project name"
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
                placeholder="Enter project description"
                maxLength="500"
              />
            </div>

            <div className="form-group">
              <label htmlFor="teamMembers">Team Members</label>
              <select
                id="teamMembers"
                name="teamMembers"
                multiple
                value={formData.teamMembers}
                onChange={handleTeamMemberChange}
                size="5"
              >
                {allUsers.map((userOption) => (
                  <option key={userOption._id} value={userOption._id}>
                    {userOption.name} ({userOption.email}) - {userOption.role}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                Hold Ctrl (or Cmd on Mac) to select multiple members
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
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

export default CreateProject;
