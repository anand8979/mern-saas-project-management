import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';
import MemberDashboard from './MemberDashboard';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
      ]);

      if (projectsRes.success) {
        setProjects(projectsRes.data.slice(0, 6)); // Show latest 6 projects
      }

      if (tasksRes.success) {
        const allTasks = tasksRes.data;
        setTasks(allTasks);
        setStats({
          totalProjects: projectsRes.success ? projectsRes.data.length : 0,
          totalTasks: allTasks.length,
          completedTasks: allTasks.filter((t) => t.status === 'done').length,
          inProgressTasks: allTasks.filter((t) => t.status === 'in-progress').length,
        });
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data for admin/manager, members use MemberDashboard
    if (user?.role !== 'member') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Render Member Dashboard for members
  if (user?.role === 'member') {
    return <MemberDashboard />;
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-projects">📁</div>
            <div className="stat-content">
              <h3>{stats.totalProjects}</h3>
              <p>Total Projects</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-tasks">✓</div>
            <div className="stat-content">
              <h3>{stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-progress">🔄</div>
            <div className="stat-content">
              <h3>{stats.inProgressTasks}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-completed">✅</div>
            <div className="stat-content">
              <h3>{stats.completedTasks}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/projects/new" className="btn btn-primary">
                + New Project
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Create your first project to get started!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project._id} className="project-card">
                  <Link to={`/projects/${project._id}`} className="project-link">
                    <h3>{project.name}</h3>
                    <p className="project-description">
                      {project.description || 'No description'}
                    </p>
                    <div className="project-meta">
                      <span className="project-creator">
                        By: {project.createdBy?.name || 'Unknown'}
                      </span>
                      <span className="project-members">
                        {project.teamMembers?.length || 0} member(s)
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Tasks</h2>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <Link to="/tasks/new" className="btn btn-primary">
                + New Task
              </Link>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet.</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.slice(0, 5).map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <Link
                      to={`/projects/${task.project?._id || task.project}`}
                      className="task-title"
                    >
                      {task.title}
                    </Link>
                    <span className="task-project">{task.project?.name || 'Unknown'}</span>
                  </div>
                  <div className="task-meta">
                    <span className={`task-status task-status-${task.status}`}>
                      {task.status}
                    </span>
                    <span className={`task-priority task-priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
