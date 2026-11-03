import api from './api';

export const auditService = {
  async getAuditLogs(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.action) queryParams.append('action', params.action);
    if (params.entity_type) queryParams.append('entity_type', params.entity_type);
    if (params.user_id) queryParams.append('user_id', params.user_id);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/audit-logs/?${queryString}` : '/api/audit-logs/';
    const response = await api.get(endpoint);
    return response.data;
  },
};
