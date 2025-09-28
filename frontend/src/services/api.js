import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  setupAdmin: () => api.post('/auth/admin/setup')
}

export const postsAPI = {
  getPosts: (params = {}) => api.get('/posts', { params }),
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPost: (id) => api.get(`/posts/${id}`)
}

export const reactionsAPI = {
  addReaction: (postId, type) => api.post(`/reactions/${postId}`, { type }),
  removeReaction: (postId) => api.delete(`/reactions/${postId}`),
  getReactions: (postId) => api.get(`/reactions/${postId}`),
  reportPost: (postId, reason) => api.post(`/reactions/${postId}/report`, { reason })
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPosts: (params = {}) => api.get('/admin/posts', { params }),
  approvePost: (id) => api.patch(`/admin/posts/${id}/approve`),
  rejectPost: (id) => api.patch(`/admin/posts/${id}/reject`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  getReports: () => api.get('/admin/reports')
}

export default api