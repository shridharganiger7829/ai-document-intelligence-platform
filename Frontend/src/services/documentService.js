import api from './api';

export const documentService = {
  async uploadSingle(file, documentType = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (documentType) {
      formData.append('document_type', documentType);
    }
    const response = await api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadBulk(files, documentType = '') {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    if (documentType) {
      formData.append('document_type', documentType);
    }
    const response = await api.post('/api/documents/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getDocuments(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.document_type) queryParams.append('document_type', params.document_type);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/documents/?${queryString}` : '/api/documents/';
    const response = await api.get(endpoint);
    return response.data;
  },

  async assignReviewer(documentId, reviewerId) {
    const response = await api.patch(`/api/documents/${documentId}/assign-reviewer`, {
      reviewer_id: Number(reviewerId),
    });
    return response.data;
  },

  async getDocumentForReview(documentId) {
    const response = await api.get(`/api/documents/${documentId}/review`);
    return response.data;
  },

  async submitReview(documentId, reviewPayload) {
    const response = await api.post(`/api/documents/${documentId}/review`, reviewPayload);
    return response.data;
  },

  async getPendingReviews() {
    const response = await api.get('/api/documents/pending-reviews');
    return response.data;
  },

  async submitAdminDecision(documentId, decisionPayload) {
    const response = await api.patch(`/api/documents/${documentId}/admin-decision`, decisionPayload);
    return response.data;
  },

  async trackDocument(documentId) {
    const response = await api.get(`/api/documents/${documentId}/tracking`);
    return response.data;
  },

  async resubmitCorrections(documentId, payload) {
    const response = await api.post(`/api/documents/${documentId}/resubmit-corrections`, payload);
    return response.data;
  },

  async getPreviewBlob(documentId) {
    const response = await api.get(`/api/documents/${documentId}/preview`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadDocument(documentId, filename = 'document.pdf') {
    const response = await api.get(`/api/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
