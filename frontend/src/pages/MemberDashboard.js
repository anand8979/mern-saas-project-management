import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const MemberDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getMyTasks();
      if (response.success) {
        setTasks(response.data);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, newStatus);
      if (response.success) {
        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );
      } else {
        setError('Failed to update task status');
      }
    } catch (err) {
      setError('Failed to update task status');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading your tasks...</div>;
  }

  const stats = {
    totalTasks: tasks.length,
    todoTasks: tasks.filter((t) => t.status === 'todo').length,
    inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
    completedTasks: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>My Dashboard</h1>
          <p>Welcome back, {user?.name}! Here are your assigned tasks.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-tasks">✓</div>
            <div className="stat-content">
              <h3>{stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-todo">📋</div>
            <div className="stat-content">
              <h3>{stats.todoTasks}</h3>
              <p>Todo</p>
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

        {/* My Tasks Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Tasks</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks assigned to you yet.</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-card-header">
                    <div>
                      <Link
                        to={`/projects/${task.project?._id || task.project}`}
                        className="task-title-link"
                      >
                        <h3>{task.title}</h3>
                      </Link>
                      <span className="task-project-name">
                        Project: {task.project?.name || 'Unknown'}
                      </span>
                    </div>
                    <span className={`task-priority task-priority-${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-card-footer">
                    <div className="task-status-control">
                      <label>Status:</label>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="task-status-select"
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>

                    {task.dueDate && (
                      <span className="task-due-date">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
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

export default MemberDashboard;
