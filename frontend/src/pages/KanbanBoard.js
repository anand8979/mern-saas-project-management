import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

const KanbanBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], 'in-progress': [], done: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProject(id);
      if (response.success) {
        setProject(response.data.project);
        const projectTasks = response.data.tasks || [];
        const groupedTasks = {
          todo: projectTasks.filter((t) => t.status === 'todo'),
          'in-progress': projectTasks.filter((t) => t.status === 'in-progress'),
          done: projectTasks.filter((t) => t.status === 'done'),
        };
        setTasks(groupedTasks);
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

  const handleDragStart = (task, status) => {
    setDraggedTask({ task, status });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus) => {
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      const response = await taskService.updateTask(draggedTask.task._id, {
        status: newStatus,
      });

      if (response.success) {
        // Update local state
        const updatedTask = response.data;
        const newTasks = { ...tasks };
        newTasks[draggedTask.status] = newTasks[draggedTask.status].filter(
          (t) => t._id !== updatedTask._id
        );
        newTasks[newStatus] = [...newTasks[newStatus], updatedTask];
        setTasks(newTasks);
      } else {
        setError('Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleTaskClick = (task) => {
    // Could navigate to task details if needed
    console.log('Task clicked:', task);
  };

  if (loading) {
    return <div className="loading">Loading kanban board...</div>;
  }

  if (!project) {
    return <div className="error-message">Project not found</div>;
  }

  const columns = [
    { id: 'todo', title: 'Todo', color: '#6c757d' },
    { id: 'in-progress', title: 'In Progress', color: '#007bff' },
    { id: 'done', title: 'Done', color: '#28a745' },
  ];

  return (
    <div className="kanban-board">
      <div className="container">
        <div className="kanban-header">
          <Link to={`/projects/${id}`} className="btn btn-secondary">
            ← Back to Project
          </Link>
          <h1>{project.name} - Kanban Board</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="kanban-container">
          {columns.map((column) => (
            <div
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="kanban-column-header" style={{ borderTopColor: column.color }}>
                <h2>{column.title}</h2>
                <span className="kanban-count">{tasks[column.id]?.length || 0}</span>
              </div>
              <div className="kanban-column-content">
                {tasks[column.id]?.map((task) => (
                  <div
                    key={task._id}
                    className="kanban-task-card"
                    draggable={
                      user?.role === 'admin' ||
                      user?.role === 'manager' ||
                      task.assignedTo?._id === user?.id
                    }
                    onDragStart={() => handleDragStart(task, column.id)}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="kanban-task-header">
                      <h3>{task.title}</h3>
                      <span className={`task-priority task-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="kanban-task-description">{task.description}</p>
                    )}
                    <div className="kanban-task-footer">
                      <span className="kanban-task-assignee">
                        {task.assignedTo?.name || 'Unassigned'}
                      </span>
                      {task.dueDate && (
                        <span className="kanban-task-date">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {tasks[column.id]?.length === 0 && (
                  <div className="kanban-empty">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
