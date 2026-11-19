import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('recolab_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for token refresh & unified error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('recolab_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          const newToken = res.data.access_token;
          localStorage.setItem('recolab_token', newToken);
          if (res.data.refresh_token) {
            localStorage.setItem('recolab_refresh_token', res.data.refresh_token);
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('recolab_token');
          localStorage.removeItem('recolab_refresh_token');
          localStorage.removeItem('recolab_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Datasets API
export const DatasetsApi = {
  list: (type?: string) => apiClient.get('/datasets', { params: { dataset_type: type } }),
  get: (id: string) => apiClient.get(`/datasets/${id}`),
  delete: (id: string) => apiClient.delete(`/datasets/${id}`),
  preview: (id: string, limit = 15) => apiClient.get(`/datasets/${id}/preview`, { params: { limit } }),
  upload: (formData: FormData) => apiClient.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Products API
export const ProductsApi = {
  list: (params: any) => apiClient.get('/products', { params }),
  get: (id: string, datasetId?: string) => apiClient.get(`/products/${id}`, { params: { dataset_id: datasetId } }),
  filters: (datasetId?: string) => apiClient.get('/products/filters', { params: { dataset_id: datasetId } }),
  create: (data: any) => apiClient.post('/products', data),
  update: (id: string, data: any, datasetId?: string) => apiClient.put(`/products/${id}`, data, { params: { dataset_id: datasetId } }),
  delete: (id: string, datasetId?: string) => apiClient.delete(`/products/${id}`, { params: { dataset_id: datasetId } }),
};

// Recommendations API
export const RecommendationsApi = {
  contentBased: (data: any) => apiClient.post('/recommendations/content-based', data),
  itemItem: (data: any) => apiClient.post('/recommendations/item-item', data),
  hybrid: (data: any) => apiClient.post('/recommendations/hybrid', data),
  getRun: (runId: string) => apiClient.get(`/recommendations/${runId}`),
  history: (limit = 20) => apiClient.get('/recommendations/history', { params: { limit } }),
};

// Benchmarking API
export const BenchmarkingApi = {
  run: (data: any) => apiClient.post('/benchmark/run', data),
  getExperiment: (id: string) => apiClient.get(`/benchmark/${id}`),
  listExperiments: (limit = 20) => apiClient.get('/benchmark/experiments', { params: { limit } }),
};

// Analytics API
export const AnalyticsApi = {
  getDashboard: (datasetId?: string) => apiClient.get('/analytics/dashboard', { params: { dataset_id: datasetId } }),
};

// Reports API
export const ReportsApi = {
  generate: (data: any) => apiClient.post('/reports/generate', data),
  list: (limit = 20) => apiClient.get('/reports', { params: { limit } }),
  downloadUrl: (id: string) => `${API_BASE_URL}/reports/${id}/download`,
};
