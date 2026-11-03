import api from './api';

export const dashboardService = {
  async getAdminDashboard() {
    const response = await api.get('/api/dashboard/admin');
    return response.data;
  },

  async getReviewerDashboard() {
    const response = await api.get('/api/dashboard/reviewer');
    return response.data;
  },

  async getEmployeeDashboard() {
    const response = await api.get('/api/dashboard/employee');
    return response.data;
  },
};
