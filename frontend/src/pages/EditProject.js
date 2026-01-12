import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teamMembers: [],
  });
  const [project, setProject] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    // Fetch users after project is loaded (especially for managers)
    if (project) {
      fetchUsers();
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(id);
      if (response.success) {
        const projectData = response.data.project;
        setProject(projectData);
        setFormData({
          name: projectData.name,
          description: projectData.description || '',
          teamMembers: projectData.teamMembers?.map((m) => m._id || m) || [],
        });
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
        // Manager can only manage existing project team members
        // Use the project's teamMembers that were loaded
        if (project?.teamMembers && project.teamMembers.length > 0) {
          setAllUsers(project.teamMembers);
        }
      }
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
    setSubmitting(true);

    try {
      const response = await projectService.updateProject(id, formData);
      if (response.success) {
        // Redirect back to project details
        navigate(`/projects/${id}`);
      } else {
        setError(response.message || 'Failed to update project');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Only admin and manager can access this page
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <div className="container">
        <div className="error-message">You are not authorized to edit projects.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (!project) {
    return <div className="error-message">Project not found</div>;
  }

  // Check if user can edit this project
  const canEdit = user?.role === 'admin' || project.createdBy?._id === user?.id;
  if (!canEdit) {
    return (
      <div className="container">
        <div className="error-message">
          You are not authorized to edit this project.
        </div>
      </div>
    );
  }

  return (
    <div className="edit-project">
      <div className="container">
        <div className="page-header">
          <h1>Edit Project</h1>
          <button onClick={() => navigate(`/projects/${id}`)} className="btn btn-secondary">
            ← Back to Project
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
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Project'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}`)}
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

export default EditProject;
