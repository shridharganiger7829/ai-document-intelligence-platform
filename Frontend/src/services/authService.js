import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/api/auth/login', credentials);
    const { access_token, user } = response.data;
    if (access_token) {
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_info', JSON.stringify(user));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user_info');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};
