import api from './api';

export const userService = {
  // Get all users (Admin only)
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get single user by ID (Admin only)
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

