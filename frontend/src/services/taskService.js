import api from './api';

export const taskService = {
  // Get all tasks
  getTasks: async (projectId = null) => {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },

  // Get single task by ID
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

