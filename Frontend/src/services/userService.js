import api from './api';

export const userService = {
  async getUsers() {
    const response = await api.get('/api/users/');
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/api/users/', userData);
    return response.data;
  },

  async updateUserStatus(userId, isActive) {
    const response = await api.patch(`/api/users/${userId}/status`, {
      is_active: isActive,
    });
    return response.data;
  },
};
