import api from './api';

export const processingService = {
  async extractDocument(documentId) {
    const response = await api.post(`/api/processing/${documentId}/extract`);
    return response.data;
  },

  async bulkExtract(documentIds) {
    const response = await api.post('/api/processing/bulk-extract', {
      document_ids: documentIds,
    });
    return response.data;
  },

  async getStatus(documentId) {
    const response = await api.get(`/api/processing/status/${documentId}`);
    return response.data;
  },

  async getBulkStatus(documentIds) {
    const response = await api.post('/api/processing/bulk-status', {
      document_ids: documentIds,
    });
    return response.data;
  },
};
